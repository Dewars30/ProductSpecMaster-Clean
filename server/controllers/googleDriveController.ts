import { Request, Response } from 'express';
import { storage } from '../services/storage';
import { googleDriveService } from '../services/googleDrive';
import { google } from 'googleapis';

/**
 * Helper function to get redirect URI
 */
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

/**
 * Initiate Google OAuth flow
 */
export const initiateGoogleAuth = (req: any, res: Response) => {
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
};

/**
 * Test endpoint for Google callback
 */
export const testGoogleCallback = (req: Request, res: Response) => {
  res.json({ message: 'Callback endpoint is reachable', timestamp: new Date().toISOString() });
};

/**
 * Handle Google OAuth callback
 */
export const handleGoogleCallback = async (req: Request, res: Response) => {
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

    const userId = state as string;
    const redirectUri = getRedirectUri();
    
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      redirectUri
    );

    console.log('Exchanging code for tokens...');
    const { tokens } = await oauth2Client.getToken(code as string);
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
};

/**
 * Sync documents from Google Drive
 */
export const syncGoogleDrive = async (req: any, res: Response) => {
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
};
