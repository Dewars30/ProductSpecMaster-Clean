import { Request, Response } from 'express';
import { storage } from '../services/storage';
import { googleDriveService } from '../services/googleDrive';
import { insertDocumentSchema } from '@shared/schema';
import { ZodError } from 'zod';

/**
 * Get all documents for the authenticated user
 */
export const getUserDocuments = async (req: any, res: Response) => {
  try {
    const userId = req.user.claims.sub;
    const page = req.query.page || 1;
    const limit = req.query.limit || 20;
    
    const documents = await storage.getUserDocuments(userId, {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
    });
    
    res.json(documents);
  } catch (error) {
    console.error("Error fetching documents:", error);
    res.status(500).json({ message: "Failed to fetch product specifications" });
  }
};

/**
 * Get a single document by ID
 */
export const getDocument = async (req: any, res: Response) => {
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
};

/**
 * Update a document's content
 */
export const updateDocument = async (req: any, res: Response) => {
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
};
