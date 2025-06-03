import { Request, Response, NextFunction } from 'express';
import { ApiError } from './errorHandler';

/**
 * Middleware to check if user is authenticated
 */
export const isAuthenticated = (req: any, res: Response, next: NextFunction) => {
  if (!req.user) {
    throw new ApiError(401, 'Authentication required');
  }
  next();
};

/**
 * Middleware to validate user has Google Drive connected
 */
export const hasGoogleDriveConnected = async (req: any, res: Response, next: NextFunction) => {
  if (!req.user) {
    throw new ApiError(401, 'Authentication required');
  }
  
  if (!req.user.access_token || !req.user.refresh_token) {
    throw new ApiError(403, 'Google Drive not connected. Please authorize access first.');
  }
  
  next();
};
