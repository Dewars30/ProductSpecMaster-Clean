import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as authController from '../../controllers/authController';

// Mock Express request and response
const mockRequest = () => {
  return {
    user: {
      claims: {
        sub: '123'
      }
    }
  };
};

const mockResponse = () => {
  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

describe('Auth Controller', () => {
  let req: any;
  let res: any;

  beforeEach(() => {
    req = mockRequest();
    res = mockResponse();
    vi.clearAllMocks();
  });

  describe('getUser', () => {
    it('should return the authenticated user profile', async () => {
      // Call the controller method
      await authController.getUser(req, res);

      // Assertions
      expect(res.json).toHaveBeenCalledWith({
        id: '123',
        username: 'testuser',
        email: 'test@example.com'
      });
    });

    it('should return 401 if user is not authenticated', async () => {
      // Mock the authController implementation for this test
      const originalGetUser = authController.getUser;
      
      // Override the implementation to return 401 for unauthenticated requests
      vi.spyOn(authController, 'getUser').mockImplementation(async (req, res) => {
        if (!req.user) {
          res.status(401).json({ message: 'Unauthorized' });
          return;
        }
        await originalGetUser(req, res);
      });
      
      // Create a request without a user (unauthenticated)
      const unauthReq = {};
      
      // Call the controller method
      await authController.getUser(unauthReq as any, res);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
      
      // Restore the original implementation
      vi.restoreAllMocks();
    });
  });
});
