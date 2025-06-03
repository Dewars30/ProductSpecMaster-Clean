import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { googleDriveService } from "./googleDrive";
import { ragService } from "./openai";
import { insertDocumentSchema, insertQuerySchema } from "@shared/schema";
import { ZodError } from "zod";
import { google } from 'googleapis';

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint for deployment monitoring
  app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });
  
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Product specifications routes
  app.get('/api/documents', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const page = req.query.page || 1;
      const limit = req.query.limit || 20;
      
      const documents = await storage.getUserDocuments(userId, {
        page: parseInt(page),
        limit: parseInt(limit),
      });
      
      res.json(documents);
    } catch (error) {
      console.error("Error fetching documents:", error);
      res.status(500).json({ message: "Failed to fetch product specifications" });
    }
  });

  app.get('/api/documents/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const documentId = parseInt(req.params.id);
      
      const document = await storage.getDocument(documentId, userId);
      if (!document) {
        return res.status(404).json({ message: "Product specification not found" });
      }
      
      res.json(document);
    } catch (error) {
      console.error("Error fetching document:", error);
      res.status(500).json({ message: "Failed to fetch product specification" });
    }
  });

  app.put('/api/documents/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const documentId = parseInt(req.params.id);
      const { content } = req.body;
      
      if (!content || typeof content !== 'string') {
        return res.status(400).json({ message: "Content is required" });
      }
      
      const document = await storage.getDocument(documentId, userId);
      if (!document) {
        return res.status(404).json({ message: "Product specification not found" });
      }
      
      // Update in Google Drive
      googleDriveService.setCredentials(req.user.access_token, req.user.refresh_token);
      await googleDriveService.updateFileContent(document.driveFileId, content);
      
      // Update in database
      const updatedDocument = await storage.updateDocument(documentId, { content });
      
      res.json(updatedDocument);
    } catch (error) {
      console.error("Error updating document:", error);
      res.status(500).json({ message: "Failed to update product specification" });
    }
  });

  // Helper function to get redirect URI
  function getRedirectUri(): string {
    if (process.env.REPLIT_DOMAINS) {
      const domain = process.env.REPLIT_DOMAINS.split(',')[0];
      return `https://${domain}/api/google/callback`;
    }
    if (process.env.NODE_ENV === 'development') {
      return 'http://localhost:5000/api/google/callback';
    }
    return process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/google/callback';
  }

  // Google Drive OAuth
  app.get('/api/google/auth', isAuthenticated, (req: any, res) => {
    console.log('Starting Google OAuth flow for user:', req.user?.claims?.sub);
    
    const redirectUri = getRedirectUri();
    console.log('Using redirect URI:', redirectUri);
    
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      redirectUri
    );

    const scopes = [
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/documents'
    ];

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      state: req.user?.claims?.sub || 'unknown',
      prompt: 'consent',
      response_type: 'code',
      include_granted_scopes: true
    });

    console.log('Generated OAuth URL:', authUrl);
    res.redirect(authUrl);
  });

  // Test route to verify callback endpoint is reachable
  app.get('/api/google/test', (req, res) => {
    res.json({ message: 'Callback endpoint is reachable', timestamp: new Date().toISOString() });
  });

  app.get('/api/google/callback', async (req: any, res) => {
    console.log('Google callback triggered with query:', req.query);
    
    try {
      const { code, state, error: oauthError } = req.query;
      
      if (oauthError) {
        console.error('OAuth error from Google:', oauthError);
        return res.redirect('/?google_error=oauth_denied');
      }
      
      if (!code) {
        console.error('No authorization code received from Google');
        return res.redirect('/?google_error=no_code');
      }

      if (!state) {
        console.error('No state parameter received');
        return res.redirect('/?google_error=no_state');
      }

      const userId = state;
      const redirectUri = getRedirectUri();
      
      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        redirectUri
      );

      console.log('Exchanging code for tokens...');
      const { tokens } = await oauth2Client.getToken(code);
      console.log('Received tokens from Google:', tokens.access_token ? 'Access token received' : 'No access token');
      
      if (!tokens.access_token) {
        console.error('No access token received from Google');
        return res.redirect('/?google_error=no_access_token');
      }
      
      // Store Google tokens in database
      await storage.updateUserGoogleTokens(userId, tokens.access_token, tokens.refresh_token ?? undefined);
      
      console.log('Google tokens stored in database for user:', userId);
      res.redirect('/?google_connected=true');
    } catch (error) {
      console.error('Google OAuth error:', error);
      res.redirect('/?google_error=callback_failed');
    }
  });

  // Google Drive sync
  app.post('/api/sync-drive', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Get user's Google tokens from database
      const user = await storage.getUser(userId);
      if (!user || !user.googleAccessToken) {
        return res.status(401).json({ message: "Google Drive not connected. Please authorize access first." });
      }

      googleDriveService.setCredentials(user.googleAccessToken, user.googleRefreshToken ?? undefined);
      // Get product specification files from Google Drive
const driveFiles = await googleDriveService.listFiles();
      
      if (!driveFiles.files) {
        return res.json({ synced: 0 });
      }
      
      let syncedCount = 0;
      
      for (const file of driveFiles.files) {
        if (!file.id || !file.name) continue;
        
        try {
          // Check if document already exists
          const existingDoc = await storage.getDocumentByDriveId(file.id);
          
          if (!existingDoc) {
            // Get file content
            const fileContent = await googleDriveService.getFileContent(file.id);
            
            // Save to database
            await storage.createDocument({
              driveFileId: file.id,
              userId,
              name: file.name,
              mimeType: file.mimeType || '',
              content: fileContent.content,
              lastModified: file.modifiedTime ? new Date(file.modifiedTime) : new Date(),
            });
            
            syncedCount++;
          }
        } catch (error) {
          console.error(`Error syncing file ${file.id}:`, error);
          // Continue with other files
        }
      }
      
      res.json({ synced: syncedCount });
    } catch (error) {
      console.error("Error syncing Google Drive:", error);
      res.status(500).json({ message: "Failed to sync Google Drive" });
    }
  });

  // AI Query routes
  app.post('/api/query', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { query } = insertQuerySchema.parse(req.body);
      
      // Get user's documents for context
      const documents = await storage.getUserDocuments(userId, { page: 1, limit: 100 });
      
      // Generate AI response with RAG
      const response = await ragService.queryDocuments(query, documents);
      
      // Save query to history
      await storage.createQuery({
        userId,
        query,
        response: response.answer,
        sources: response.sources,
      });
      
      res.json(response);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid query format" });
      }
      
      console.error("Error processing query:", error);
      res.status(500).json({ message: "Failed to process query" });
    }
  });

  app.get('/api/queries', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const page = req.query.page || 1;
      const limit = req.query.limit || 10;
      
      const queries = await storage.getUserQueries(userId, {
        page: parseInt(page),
        limit: parseInt(limit),
      });
      
      res.json(queries);
    } catch (error) {
      console.error("Error fetching queries:", error);
      res.status(500).json({ message: "Failed to fetch queries" });
    }
  });

  // AI Suggestions
  app.post('/api/product-spec/:id/summarize', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const documentId = parseInt(req.params.id);
      
      const document = await storage.getDocument(documentId, userId);
      if (!document) {
        return res.status(404).json({ message: "Product specification not found" });
      }
      
      const summary = await ragService.summarizeProductSpec(document.content || '');
      res.json({ summary });
    } catch (error) {
      console.error("Error summarizing document:", error);
      res.status(500).json({ message: "Failed to summarize product specification" });
    }
  });

  app.post('/api/product-spec/:id/extract-actions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const documentId = parseInt(req.params.id);
      
      const document = await storage.getDocument(documentId, userId);
      if (!document) {
        return res.status(404).json({ message: "Product specification not found" });
      }
      
      const actions = await ragService.extractActionItems(document.content || '');
      res.json({ actions });
    } catch (error) {
      console.error("Error extracting action items:", error);
      res.status(500).json({ message: "Failed to extract action items from product specification" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
