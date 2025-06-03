import {
  users,
  documents,
  queries,
  type User,
  type UpsertUser,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserGoogleTokens(userId: string, accessToken?: string, refreshToken?: string): Promise<User>;
  // Other operations
}

export class DatabaseStorage implements IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Document operations
  async getUserDocuments(userId: string, options: { page: number; limit: number }) {
    const { page, limit } = options;
    const offset = (page - 1) * limit;
    
    const docs = await db.select()
      .from(documents)
      .where(eq(documents.userId, userId))
      .orderBy(desc(documents.lastModified))
      .limit(limit)
      .offset(offset);
    
    return docs;
  }

  async getDocument(documentId: number, userId: string) {
    const [doc] = await db.select()
      .from(documents)
      .where(and(eq(documents.id, documentId), eq(documents.userId, userId)));
    
    return doc;
  }

  async getDocumentByDriveId(driveFileId: string) {
    const [doc] = await db.select()
      .from(documents)
      .where(eq(documents.driveFileId, driveFileId));
    
    return doc;
  }

  async createDocument(data: any) {
    const [doc] = await db.insert(documents).values(data).returning();
    return doc;
  }

  async updateDocument(documentId: number, data: any) {
    const [doc] = await db.update(documents)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(documents.id, documentId))
      .returning();
    
    return doc;
  }

  // Query operations
  async createQuery(data: any) {
    const [query] = await db.insert(queries).values(data).returning();
    return query;
  }

  async getUserQueries(userId: string, options: { page: number; limit: number }) {
    const { page, limit } = options;
    const offset = (page - 1) * limit;
    
    const userQueries = await db.select()
      .from(queries)
      .where(eq(queries.userId, userId))
      .orderBy(desc(queries.createdAt))
      .limit(limit)
      .offset(offset);
    
    return userQueries;
  }

  async updateUserGoogleTokens(userId: string, accessToken?: string, refreshToken?: string) {
    const [user] = await db
      .update(users)
      .set({
        googleAccessToken: accessToken,
        googleRefreshToken: refreshToken,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }
}

export const storage = new DatabaseStorage();
