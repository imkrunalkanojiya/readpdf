import {
  users, 
  type User, 
  type InsertUser,
  categories,
  type Category,
  type InsertCategory,
  documents,
  type Document,
  type InsertDocument
} from "@shared/schema";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Categories
  getAllCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  getCategoryByName(name: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Documents
  getAllDocuments(): Promise<Document[]>;
  getDocument(id: number): Promise<Document | undefined>;
  getDocumentsByCategory(categoryId: number): Promise<Document[]>;
  createDocument(document: InsertDocument): Promise<Document>;
  updateDocument(id: number, document: Partial<Document>): Promise<Document>;
  deleteDocument(id: number): Promise<boolean>;
  searchDocuments(query: string): Promise<Document[]>;
  getFavoriteDocuments(): Promise<Document[]>;
  getRecentDocuments(limit?: number): Promise<Document[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private categories: Map<number, Category>;
  private documents: Map<number, Document>;
  private userIdCounter: number;
  private categoryIdCounter: number;
  private documentIdCounter: number;

  constructor() {
    this.users = new Map();
    this.categories = new Map();
    this.documents = new Map();
    this.userIdCounter = 1;
    this.categoryIdCounter = 1;
    this.documentIdCounter = 1;
    
    // Initialize with default categories
    this.initializeDefaultCategories();
  }

  private initializeDefaultCategories() {
    const defaultCategories = ["Academic", "Business", "Personal"];
    defaultCategories.forEach(name => {
      this.createCategory({ name });
    });
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Categories
  async getAllCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategory(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async getCategoryByName(name: string): Promise<Category | undefined> {
    return Array.from(this.categories.values()).find(
      (category) => category.name.toLowerCase() === name.toLowerCase(),
    );
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = this.categoryIdCounter++;
    const category: Category = { ...insertCategory, id };
    this.categories.set(id, category);
    return category;
  }

  // Documents
  async getAllDocuments(): Promise<Document[]> {
    return Array.from(this.documents.values());
  }

  async getDocument(id: number): Promise<Document | undefined> {
    return this.documents.get(id);
  }

  async getDocumentsByCategory(categoryId: number): Promise<Document[]> {
    return Array.from(this.documents.values()).filter(
      (document) => document.categoryId === categoryId,
    );
  }

  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const id = this.documentIdCounter++;
    const now = new Date();
    const document: Document = { 
      ...insertDocument, 
      id, 
      uploadedAt: now,
      lastOpenedAt: now
    };
    this.documents.set(id, document);
    return document;
  }

  async updateDocument(id: number, documentUpdate: Partial<Document>): Promise<Document> {
    const document = this.documents.get(id);
    if (!document) {
      throw new Error(`Document with id ${id} not found`);
    }
    
    const updatedDocument = { ...document, ...documentUpdate };
    this.documents.set(id, updatedDocument);
    return updatedDocument;
  }

  async deleteDocument(id: number): Promise<boolean> {
    return this.documents.delete(id);
  }

  async searchDocuments(query: string): Promise<Document[]> {
    const normalizedQuery = query.toLowerCase();
    return Array.from(this.documents.values()).filter(
      (document) => document.title.toLowerCase().includes(normalizedQuery)
    );
  }

  async getFavoriteDocuments(): Promise<Document[]> {
    return Array.from(this.documents.values()).filter(
      (document) => document.favorite
    );
  }

  async getRecentDocuments(limit = 10): Promise<Document[]> {
    return Array.from(this.documents.values())
      .sort((a, b) => {
        const aTime = a.lastOpenedAt || a.uploadedAt;
        const bTime = b.lastOpenedAt || b.uploadedAt;
        return bTime.getTime() - aTime.getTime();
      })
      .slice(0, limit);
  }
}

export const storage = new MemStorage();
