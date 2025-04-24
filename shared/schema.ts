import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// PDF Document Schema
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
});

export const insertCategorySchema = createInsertSchema(categories).pick({
  name: true,
});

export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;

export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  filename: text("filename").notNull(),
  size: integer("size").notNull(), // Size in bytes
  categoryId: integer("category_id"),
  thumbnail: text("thumbnail"),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
  lastOpenedAt: timestamp("last_opened_at"),
  favorite: boolean("favorite").default(false),
  totalPages: integer("total_pages"),
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  uploadedAt: true,
  lastOpenedAt: true,
});

export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;

export const annotations = pgTable("annotations", {
  id: serial("id").primaryKey(),
  documentId: integer("document_id").references(() => documents.id),
  type: text("type").notNull(),
  content: text("content").notNull(),
  pageNumber: integer("page_number").notNull(),
  coordinates: text("coordinates").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  createdBy: integer("created_by").references(() => users.id),
});

export const insertAnnotationSchema = createInsertSchema(annotations);
export type Annotation = typeof annotations.$inferSelect;
