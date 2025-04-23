import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import path from "path";
import fs from "fs";
import { insertDocumentSchema, insertCategorySchema } from "@shared/schema";
import { PDFDocument } from "pdf-lib";

// Set up multer for PDF uploads
const uploadsDir = path.join(import.meta.dirname, "..", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage_config = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage_config,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB limit
  fileFilter: function (req, file, cb) {
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Only PDF files are allowed'));
    }
    cb(null, true);
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all categories
  app.get('/api/categories', async (req, res) => {
    try {
      const categories = await storage.getAllCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching categories' });
    }
  });

  // Create a new category
  app.post('/api/categories', async (req, res) => {
    try {
      const validatedData = insertCategorySchema.parse(req.body);
      const existingCategory = await storage.getCategoryByName(validatedData.name);
      
      if (existingCategory) {
        return res.status(400).json({ message: 'Category already exists' });
      }
      
      const category = await storage.createCategory(validatedData);
      res.status(201).json(category);
    } catch (error) {
      res.status(400).json({ message: 'Invalid category data' });
    }
  });

  // Get all documents
  app.get('/api/documents', async (req, res) => {
    try {
      let documents;
      
      if (req.query.category) {
        const categoryId = parseInt(req.query.category as string);
        documents = await storage.getDocumentsByCategory(categoryId);
      } else if (req.query.search) {
        documents = await storage.searchDocuments(req.query.search as string);
      } else if (req.query.favorite === 'true') {
        documents = await storage.getFavoriteDocuments();
      } else if (req.query.recent === 'true') {
        const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
        documents = await storage.getRecentDocuments(limit);
      } else {
        documents = await storage.getAllDocuments();
      }
      
      res.json(documents);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching documents' });
    }
  });

  // Get document by id
  app.get('/api/documents/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const document = await storage.getDocument(id);
      
      if (!document) {
        return res.status(404).json({ message: 'Document not found' });
      }
      
      // Update last opened time
      await storage.updateDocument(id, { 
        lastOpenedAt: new Date() 
      });
      
      res.json(document);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching document' });
    }
  });

  // Upload a new document
  app.post('/api/documents', upload.single('file'), async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    try {
      const fileSize = req.file.size;
      const originalName = req.file.originalname;
      const title = req.body.title || path.parse(originalName).name;
      const categoryId = req.body.categoryId ? parseInt(req.body.categoryId) : undefined;
      
      // Read PDF to get total pages
      const pdfBytes = fs.readFileSync(req.file.path);
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const totalPages = pdfDoc.getPageCount();

      const documentData = {
        title,
        filename: req.file.filename,
        size: fileSize,
        categoryId,
        thumbnail: null, // We could generate this, but it's complex for this implementation
        totalPages
      };
      
      const validatedData = insertDocumentSchema.parse(documentData);
      const document = await storage.createDocument(validatedData);
      
      res.status(201).json(document);
    } catch (error) {
      // If there was an error, remove the uploaded file
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      
      res.status(400).json({ message: 'Error uploading document' });
    }
  });

  // Update document
  app.patch('/api/documents/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const document = await storage.getDocument(id);
      
      if (!document) {
        return res.status(404).json({ message: 'Document not found' });
      }
      
      const updatedDocument = await storage.updateDocument(id, req.body);
      res.json(updatedDocument);
    } catch (error) {
      res.status(400).json({ message: 'Error updating document' });
    }
  });

  // Delete document
  app.delete('/api/documents/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const document = await storage.getDocument(id);
      
      if (!document) {
        return res.status(404).json({ message: 'Document not found' });
      }
      
      // Delete file from disk
      const filePath = path.join(uploadsDir, document.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      
      await storage.deleteDocument(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Error deleting document' });
    }
  });

  // Serve PDFs
  app.get('/api/view/:filename', (req, res) => {
    const filePath = path.join(uploadsDir, req.params.filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found' });
    }
    
    res.setHeader('Content-Type', 'application/pdf');
    fs.createReadStream(filePath).pipe(res);
  });
  
  // Serve the PDF.js worker file
  app.get('/pdf.worker.js', (req, res) => {
    const clientPublicDir = path.join(import.meta.dirname, '..', 'client', 'public');
    const workerPath = path.join(clientPublicDir, 'pdf.worker.js');
    
    if (fs.existsSync(workerPath)) {
      res.setHeader('Content-Type', 'application/javascript');
      fs.createReadStream(workerPath).pipe(res);
    } else {
      res.status(404).send('Worker file not found');
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
