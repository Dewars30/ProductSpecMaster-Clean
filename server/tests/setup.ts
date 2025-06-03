// Test setup file for Vitest

import { vi } from 'vitest';

// Mock environment variables for tests
process.env.NODE_ENV = 'test';
process.env.PORT = '3001';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';
process.env.OPENAI_API_KEY = 'test_openai_key';
process.env.GOOGLE_CLIENT_ID = 'test_google_client_id';
process.env.GOOGLE_CLIENT_SECRET = 'test_google_client_secret';
process.env.REPLIT_CLIENT_ID = 'test_replit_client_id';
process.env.REPLIT_CLIENT_SECRET = 'test_replit_client_secret';
process.env.REPLIT_ENCRYPTION_KEY = 'test_encryption_key';
process.env.REPLIT_DOMAINS = 'test-app.repl.co';
process.env.REPL_ID = 'test-repl-id';
process.env.SESSION_SECRET = 'test-session-secret';
process.env.ISSUER_URL = 'https://replit.com/oidc';

// Mock OpenAI
vi.mock('openai', () => {
  // Create a mock class
  class MockOpenAI {
    embeddings = {
      create: vi.fn().mockResolvedValue({
        data: [{ embedding: [0.1, 0.2, 0.3, 0.4] }]
      })
    };
    
    chat = {
      completions: {
        create: vi.fn().mockResolvedValue({
          choices: [
            {
              message: {
                content: 'This is a mock response from OpenAI'
              }
            }
          ]
        })
      }
    };
  }
  
  // Create the constructor function
  const OpenAIConstructor = vi.fn().mockImplementation(() => new MockOpenAI());
  
  // Return the mock
  return {
    default: OpenAIConstructor,
    OpenAI: OpenAIConstructor
  };
});

// Mock database connections
vi.mock('../services/db', () => {
  return {
    db: {
      query: vi.fn().mockResolvedValue([]),
      transaction: vi.fn().mockImplementation((callback) => callback({ query: vi.fn().mockResolvedValue([]) }))
    }
  };
});

// Mock storage service
vi.mock('../services/storage', () => {
  return {
    storage: {
      getUser: vi.fn().mockResolvedValue({
        id: '123',
        username: 'testuser',
        email: 'test@example.com'
      }),
      saveUser: vi.fn().mockResolvedValue(true),
      getUserDocuments: vi.fn().mockResolvedValue([]),
      getDocument: vi.fn().mockResolvedValue({}),
      updateDocument: vi.fn().mockResolvedValue({})
    }
  };
});

// Mock Google Drive API
vi.mock('../services/googleDrive', () => {
  return {
    getGoogleDriveClient: vi.fn().mockReturnValue({
      files: {
        list: vi.fn().mockResolvedValue({ data: { files: [] } }),
        get: vi.fn().mockResolvedValue({ data: {} })
      }
    })
  };
});
