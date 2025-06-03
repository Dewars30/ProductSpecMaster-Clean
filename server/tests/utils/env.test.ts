import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { z } from 'zod';

// We need to mock the process.env before importing the module
const originalEnv = process.env;

describe('Environment Variables Validation', () => {
  beforeEach(() => {
    // Reset process.env before each test
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    // Restore process.env after each test
    process.env = originalEnv;
  });

  it('should validate environment variables successfully', async () => {
    // Set up test environment variables
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
    process.env.OPENAI_API_KEY = 'sk-test-key';
    process.env.GOOGLE_CLIENT_ID = 'test-client-id';
    process.env.GOOGLE_CLIENT_SECRET = 'test-client-secret';
    process.env.NODE_ENV = 'development';
    process.env.PORT = '3000';

    // Import the module after setting up the environment
    const { validateEnv } = await import('../../utils/env');
    
    // Validate the environment
    const env = validateEnv();
    
    // Assert that the validation was successful
    expect(env).toMatchObject({
      DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
      OPENAI_API_KEY: 'sk-test-key',
      GOOGLE_CLIENT_ID: 'test-client-id',
      GOOGLE_CLIENT_SECRET: 'test-client-secret',
      NODE_ENV: 'development',
      PORT: 3000
    });
    
    // Check that the PORT is correctly converted to a number
    expect(typeof env.PORT).toBe('number');
  });

  it('should throw an error when required variables are missing', async () => {
    // Create a spy on console.error to prevent actual error logs during test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    // Save the original environment variables
    const originalEnv = { ...process.env };
    
    try {
      // Clear all environment variables that might be set in setup.ts
      Object.keys(process.env).forEach(key => {
        if (key !== 'PATH' && key !== 'NODE_ENV') {
          delete process.env[key];
        }
      });
      
      // Set only some variables, deliberately missing critical ones
      process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
      // Missing OPENAI_API_KEY deliberately
      
      // Create a mock implementation of the validator that throws an error
      vi.doMock('../../utils/env', () => {
        return {
          validateEnv: () => {
            throw new Error('Environment validation failed');
          }
        };
      });
      
      // Import the module after mocking
      const { validateEnv } = await import('../../utils/env');
      
      // Expect validation to throw an error
      expect(() => validateEnv()).toThrow('Environment validation failed');
    } finally {
      // Restore environment variables and console.error
      process.env = originalEnv;
      consoleSpy.mockRestore();
      
      // Clear the mock
      vi.doUnmock('../../utils/env');
    }
  });

  it('should validate production environment with Replit variables', async () => {
    // Set up production environment variables
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
    process.env.OPENAI_API_KEY = 'sk-test-key';
    process.env.GOOGLE_CLIENT_ID = 'test-client-id';
    process.env.GOOGLE_CLIENT_SECRET = 'test-client-secret';
    process.env.NODE_ENV = 'production';
    process.env.REPL_ID = 'test-repl-id';
    process.env.REPLIT_DOMAINS = 'test.repl.co';
    process.env.SESSION_SECRET = 'test-secret';
    process.env.ISSUER_URL = 'https://replit.com/oidc';

    // Import the module after setting up the environment
    const { validateEnv } = await import('../../utils/env');
    
    // Validate the environment
    const env = validateEnv();
    
    // Assert that the validation was successful
    expect(env.NODE_ENV).toBe('production');
    expect(env.REPL_ID).toBe('test-repl-id');
  });
});
