import { describe, it, expect, vi, beforeEach } from 'vitest';
import { errorHandler } from '../../middleware/errorHandler';
import { z } from 'zod';
import { APIError } from '../../utils/errors';

// Mock Express request and response
const mockRequest = () => {
  return {} as any;
};

const mockResponse = () => {
  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

const mockNext = vi.fn();

describe('Error Handler Middleware', () => {
  let req: any;
  let res: any;

  beforeEach(() => {
    req = mockRequest();
    res = mockResponse();
    vi.clearAllMocks();
  });

  it('should handle API errors correctly', () => {
    const apiError = new APIError('Test API error', 400);
    
    errorHandler(apiError, req, res, mockNext);
    
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        message: 'Test API error',
        status: 400
      }
    });
  });

  it('should handle Zod validation errors correctly', () => {
    const schema = z.object({
      name: z.string(),
      age: z.number().min(18)
    });
    
    try {
      schema.parse({ name: 'Test', age: 16 });
    } catch (error) {
      errorHandler(error, req, res, mockNext);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: {
          message: 'Validation error',
          status: 400,
          errors: expect.any(Array)
        }
      });
    }
  });

  it('should handle generic errors correctly', () => {
    const genericError = new Error('Something went wrong');
    
    // Mock NODE_ENV to be production
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    
    errorHandler(genericError, req, res, mockNext);
    
    // In production, we don't expose error details
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        message: 'Internal Server Error',
        status: 500
      }
    });
    
    // Restore NODE_ENV
    process.env.NODE_ENV = originalNodeEnv;
  });

  it('should include error details in development mode', () => {
    const genericError = new Error('Development error details');
    
    // Mock NODE_ENV to be development
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    
    errorHandler(genericError, req, res, mockNext);
    
    // In development, we expose error details
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        message: 'Development error details',
        status: 500,
        stack: expect.any(String)
      }
    });
    
    // Restore NODE_ENV
    process.env.NODE_ENV = originalNodeEnv;
  });
});
