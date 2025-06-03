import { describe, it, expect, vi, beforeEach } from 'vitest';
import express, { Express } from 'express';
import { registerRoutes } from '../../routes';

// Mock express app
vi.mock('express', () => {
  const mockApp = {
    use: vi.fn(),
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    set: vi.fn() // Add missing set method
  };
  return {
    default: vi.fn(() => mockApp),
    Router: vi.fn(() => ({
      use: vi.fn(),
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn()
    }))
  };
});

// Mock controllers
vi.mock('../../controllers/authController', () => ({
  getUser: vi.fn(),
  getProfile: vi.fn(),
  googleCallback: vi.fn(),
  googleLogin: vi.fn(),
  logout: vi.fn()
}));

vi.mock('../../controllers/documentController', () => ({
  getUserDocuments: vi.fn(),
  createDocument: vi.fn(),
  getDocument: vi.fn(),
  getDocuments: vi.fn(),
  updateDocument: vi.fn(),
  deleteDocument: vi.fn()
}));

vi.mock('../../middleware/auth', () => ({
  isAuthenticated: vi.fn()
}));

vi.mock('../../middleware/errorHandler', () => ({
  errorHandler: vi.fn()
}));

// Mock setupAuth and auth middleware
vi.mock('../../replitAuth', () => ({
  setupAuth: vi.fn().mockResolvedValue(undefined),
  isAuthenticated: vi.fn((req, res, next) => next())
}));

describe('Routes Registration', () => {
  let app: Express;

  beforeEach(() => {
    vi.clearAllMocks();
    app = express();
  });

  it('should register all routes correctly', async () => {
    // Mock app.use to actually be called
    vi.mocked(app.use).mockImplementation(() => app);
    vi.mocked(app.get).mockImplementation(() => app);
    
    await registerRoutes(app);
    
    // Check that routes are registered
    expect(app.get).toHaveBeenCalledWith(
      '/api/auth/user', 
      expect.any(Function), 
      expect.any(Function)
    );
  });

  it('should register auth routes', async () => {
    await registerRoutes(app);
    
    // Check that auth routes are registered
    expect(app.get).toHaveBeenCalledWith(
      '/api/auth/user', 
      expect.any(Function), 
      expect.any(Function)
    );
  });

  it('should register document routes', async () => {
    await registerRoutes(app);
    
    // Check that document routes are registered
    expect(app.get).toHaveBeenCalledWith(
      '/api/documents', 
      expect.any(Function), 
      expect.any(Function)
    );
  });
});
