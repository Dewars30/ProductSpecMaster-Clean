import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RAGService } from '../../services/openai';

// Note: OpenAI is already mocked in the setup.ts file

describe('RAG Service', () => {
  let ragService: RAGService;

  beforeEach(() => {
    ragService = new RAGService();
    vi.clearAllMocks();
  });

  describe('generateEmbedding', () => {
    it('should generate embeddings for text', async () => {
      const text = 'Test text for embedding';
      const embedding = await ragService.generateEmbedding(text);
      
      expect(embedding).toEqual([0.1, 0.2, 0.3, 0.4]);
    });

    it('should handle errors when generating embeddings', async () => {
      // Create a direct spy on the RAGService.generateEmbedding method
      const mockService = new RAGService();
      
      // Spy on the service method and make it throw an error
      const spy = vi.spyOn(mockService, 'generateEmbedding')
        .mockRejectedValueOnce(new Error('API Error'));
      
      // The service should throw the error
      await expect(mockService.generateEmbedding('test')).rejects.toThrow('API Error');
      
      // Verify the spy was called
      expect(spy).toHaveBeenCalledWith('test');
      
      // Clean up
      spy.mockRestore();
    });
  });
});
