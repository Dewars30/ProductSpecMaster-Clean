import OpenAI from "openai";
import type { Document } from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR 
});

export class RAGService {
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: text,
      });
      
      return response.data[0].embedding;
    } catch (error) {
      console.error('Error generating embedding:', error);
      throw new Error('Failed to generate text embedding');
    }
  }

  async chunkDocument(content: string, chunkSize: number = 1000): Promise<string[]> {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const chunks: string[] = [];
    let currentChunk = '';
    
    for (const sentence of sentences) {
      if (currentChunk.length + sentence.length > chunkSize && currentChunk.length > 0) {
        chunks.push(currentChunk.trim());
        currentChunk = sentence;
      } else {
        currentChunk += (currentChunk ? '. ' : '') + sentence;
      }
    }
    
    if (currentChunk.trim().length > 0) {
      chunks.push(currentChunk.trim());
    }
    
    return chunks;
  }

  calculateCosineSimilarity(a: number[], b: number[]): number {
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (magnitudeA * magnitudeB);
  }

  async findRelevantChunks(query: string, documents: Document[], topK: number = 5): Promise<{
    content: string;
    documentName: string;
    documentId: number;
    similarity: number;
  }[]> {
    try {
      const queryEmbedding = await this.generateEmbedding(query);
      const results: Array<{
        content: string;
        documentName: string;
        documentId: number;
        similarity: number;
      }> = [];

      for (const doc of documents) {
        if (!doc.content) continue;
        
        const chunks = await this.chunkDocument(doc.content);
        
        for (const chunk of chunks) {
          const chunkEmbedding = await this.generateEmbedding(chunk);
          const similarity = this.calculateCosineSimilarity(queryEmbedding, chunkEmbedding);
          
          results.push({
            content: chunk,
            documentName: doc.name,
            documentId: doc.id,
            similarity,
          });
        }
      }

      return results
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, topK);
    } catch (error) {
      console.error('Error finding relevant chunks:', error);
      throw new Error('Failed to find relevant document chunks');
    }
  }

  async queryDocuments(query: string, documents: Document[]): Promise<{
    answer: string;
    sources: Array<{
      documentName: string;
      documentId: number;
      snippet: string;
      relevance: number;
    }>;
  }> {
    try {
      const relevantChunks = await this.findRelevantChunks(query, documents, 5);
      
      if (relevantChunks.length === 0) {
        return {
          answer: "I couldn't find any relevant information in your documents to answer this query.",
          sources: [],
        };
      }

      const context = relevantChunks
        .map((chunk, i) => `[${i + 1}] From "${chunk.documentName}": ${chunk.content}`)
        .join('\n\n');

      const prompt = `Based on the following document excerpts, please answer the user's question comprehensively. Use specific details from the provided context and cite your sources by referencing the document names.

Context:
${context}

Question: ${query}

Please provide a detailed answer with citations in the following JSON format:
{
  "answer": "Your comprehensive answer here, citing specific documents when referencing information",
  "confidence": 0.95
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an AI assistant that helps users understand their product specifications. Always provide accurate, well-sourced answers based on the provided context. When you reference information, mention which product specification it came from."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      
      return {
        answer: result.answer || "I couldn't generate a proper response based on your documents.",
        sources: relevantChunks.map(chunk => ({
          documentName: chunk.documentName,
          documentId: chunk.documentId,
          snippet: chunk.content.substring(0, 200) + (chunk.content.length > 200 ? '...' : ''),
          relevance: Math.round(chunk.similarity * 100) / 100,
        })),
      };
    } catch (error) {
      console.error('Error querying documents:', error);
      throw new Error('Failed to process document query');
    }
  }

  async summarizeProductSpec(content: string): Promise<string> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an AI assistant that creates concise, informative summaries of product specifications. Focus on key requirements, features, dependencies, and technical details."
          },
          {
            role: "user",
            content: `Please provide a comprehensive summary of the following document:\n\n${content}`
          }
        ],
        temperature: 0.3,
        max_tokens: 500,
      });

      return response.choices[0].message.content || "Unable to generate summary.";
    } catch (error) {
      console.error('Error summarizing document:', error);
      throw new Error('Failed to summarize document');
    }
  }

  async extractActionItems(content: string): Promise<string[]> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an AI assistant that extracts actionable items from product specifications. Identify implementation tasks, technical requirements, dependencies, and milestones. Return the result as a JSON array of strings."
          },
          {
            role: "user",
            content: `Extract all action items from the following document:\n\n${content}\n\nReturn as JSON: {"actions": ["action 1", "action 2", ...]}`
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.2,
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      return result.actions || [];
    } catch (error) {
      console.error('Error extracting action items:', error);
      throw new Error('Failed to extract action items');
    }
  }

  async suggestImprovements(content: string): Promise<string[]> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an AI product specialist that provides helpful suggestions to improve product specifications. Focus on completeness, technical clarity, consistency, and implementability."
          },
          {
            role: "user",
            content: `Please analyze this product specification and suggest improvements:\n\n${content}\n\nReturn as JSON: {"suggestions": ["suggestion 1", "suggestion 2", ...]}`
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.4,
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      return result.suggestions || [];
    } catch (error) {
      console.error('Error generating suggestions:', error);
      throw new Error('Failed to generate improvement suggestions');
    }
  }
}

export const ragService = new RAGService();
