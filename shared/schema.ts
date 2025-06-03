import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  googleAccessToken: varchar("google_access_token"),
  googleRefreshToken: varchar("google_refresh_token"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Documents table for Google Drive integration
export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  driveFileId: varchar("drive_file_id").notNull().unique(),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: varchar("name").notNull(),
  mimeType: varchar("mime_type"),
  content: text("content"),
  lastModified: timestamp("last_modified"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Embeddings table for RAG functionality
export const embeddings = pgTable("embeddings", {
  id: serial("id").primaryKey(),
  documentId: serial("document_id").notNull().references(() => documents.id),
  chunkIndex: serial("chunk_index").notNull(),
  content: text("content").notNull(),
  embedding: text("embedding").notNull(), // JSON string of vector
  createdAt: timestamp("created_at").defaultNow(),
});

// Queries table for AI conversation history
export const queries = pgTable("queries", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  query: text("query").notNull(),
  response: text("response").notNull(),
  sources: jsonb("sources"), // Array of source documents with citations
  createdAt: timestamp("created_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export const insertDocumentSchema = createInsertSchema(documents).pick({
  driveFileId: true,
  name: true,
  mimeType: true,
  content: true,
  lastModified: true,
});

export const insertQuerySchema = createInsertSchema(queries).pick({
  query: true,
});

export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;
export type InsertQuery = z.infer<typeof insertQuerySchema>;
export type Query = typeof queries.$inferSelect;
export type Embedding = typeof embeddings.$inferSelect;
