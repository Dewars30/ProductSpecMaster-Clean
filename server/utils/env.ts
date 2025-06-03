import { z } from 'zod';

// Define the schema for required environment variables
const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  
  // OpenAI
  OPENAI_API_KEY: z.string().min(1, 'OPENAI_API_KEY is required'),
  
  // Google OAuth
  GOOGLE_CLIENT_ID: z.string().min(1, 'GOOGLE_CLIENT_ID is required'),
  GOOGLE_CLIENT_SECRET: z.string().min(1, 'GOOGLE_CLIENT_SECRET is required'),
  
  // Optional variables with defaults
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(val => parseInt(val, 10)).default('5000'),
  
  // Replit Auth (required in production)
  REPL_ID: z.string().optional(),
  REPLIT_DOMAINS: z.string().optional(),
  SESSION_SECRET: z.string().optional(),
  ISSUER_URL: z.string().optional(),
});

// Define the type for our validated environment
export type Env = z.infer<typeof envSchema>;

/**
 * Validates environment variables against the schema
 * @returns A validated environment object
 * @throws Error if validation fails
 */
export function validateEnv(): Env {
  try {
    // Parse and validate environment variables
    const env = envSchema.parse(process.env);
    
    // Additional validation for production environment
    if (env.NODE_ENV === 'production') {
      // In production, Replit auth variables are required
      if (!process.env.REPL_ID || !process.env.REPLIT_DOMAINS || !process.env.SESSION_SECRET) {
        throw new Error('Replit authentication variables are required in production');
      }
    }
    
    return env;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(err => `${err.path}: ${err.message}`).join('\n');
      throw new Error(`Environment validation failed:\n${errorMessages}`);
    }
    throw error;
  }
}

// Export a singleton instance of the validated environment
export const env = validateEnv();
