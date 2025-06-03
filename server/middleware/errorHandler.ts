import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { APIError } from '../utils/errors';

/**
 * Global error handling middleware
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err);

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: {
        message: 'Validation error',
        status: 400,
        errors: err.errors.map(e => ({
          path: e.path.join('.'),
          message: e.message
        }))
      }
    });
  }

  // Handle custom API errors
  if (err instanceof APIError) {
    return res.status(err.status).json({
      error: {
        message: err.message,
        status: err.status
      }
    });
  }

  // Handle all other errors
  const statusCode = 500;
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal Server Error' 
    : err.message || 'Internal Server Error';

  return res.status(statusCode).json({
    error: {
      message,
      status: statusCode,
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    }
  });
};
