import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth, isAuthenticated } from "../replitAuth";
import { errorHandler } from "../middleware/errorHandler";
import { hasGoogleDriveConnected } from "../middleware/authMiddleware";

// Import controllers
import * as authController from "../controllers/authController";
import * as documentController from "../controllers/documentController";
import * as googleDriveController from "../controllers/googleDriveController";
import * as queryController from "../controllers/queryController";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, authController.getUser);

  // Product specifications routes
  app.get('/api/documents', isAuthenticated, documentController.getUserDocuments);
  app.get('/api/documents/:id', isAuthenticated, documentController.getDocument);
  app.put('/api/documents/:id', isAuthenticated, documentController.updateDocument);

  // Google Drive OAuth
  app.get('/api/google/auth', isAuthenticated, googleDriveController.initiateGoogleAuth);
  app.get('/api/google/test', googleDriveController.testGoogleCallback);
  app.get('/api/google/callback', googleDriveController.handleGoogleCallback);

  // Google Drive sync
  app.post('/api/sync-drive', isAuthenticated, googleDriveController.syncGoogleDrive);

  // AI Query routes
  app.post('/api/query', isAuthenticated, queryController.processQuery);
  app.get('/api/queries', isAuthenticated, queryController.getQueryHistory);

  // AI Suggestions
  app.post('/api/product-spec/:id/summarize', isAuthenticated, queryController.summarizeProductSpec);
  app.post('/api/product-spec/:id/extract-actions', isAuthenticated, queryController.extractActionItems);

  // Error handling middleware
  app.use(errorHandler);

  const httpServer = createServer(app);
  return httpServer;
}
