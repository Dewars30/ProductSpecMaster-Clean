import { Request, Response } from 'express';
import { storage } from '../services/storage';
import { ragService } from '../services/openai';
import { insertQuerySchema } from '@shared/schema';
import { ZodError } from 'zod';

/**
 * Process an AI query against user documents
 */
export const processQuery = async (req: any, res: Response) => {
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
      return res.status(400).json({ message: "Invalid query format", errors: error.errors });
    }
    
    console.error("Error processing query:", error);
    res.status(500).json({ message: "Failed to process query" });
  }
};

/**
 * Get query history for the user
 */
export const getQueryHistory = async (req: any, res: Response) => {
  try {
    const userId = req.user.claims.sub;
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    
    const queries = await storage.getUserQueries(userId, {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
    });
    
    res.json(queries);
  } catch (error) {
    console.error("Error fetching queries:", error);
    res.status(500).json({ message: "Failed to fetch queries" });
  }
};

/**
 * Summarize a product specification
 */
export const summarizeProductSpec = async (req: any, res: Response) => {
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
};

/**
 * Extract action items from a product specification
 */
export const extractActionItems = async (req: any, res: Response) => {
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
};
