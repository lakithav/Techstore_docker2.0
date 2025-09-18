import express, { type Request, Response, NextFunction } from "express";
import mongoose from 'mongoose';
import path from 'path';
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { seedDatabase } from './seed';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Add global variable to store MongoDB URI
let mongoUri: string;

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    // Use in-memory MongoDB for development
    if (process.env.NODE_ENV === 'development') {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      mongoUri = mongoServer.getUri();
      console.log('\n🔌 MongoDB Memory Server URL:', mongoUri);
      console.log('📝 You can use MongoDB Compass with this connection string to view the database\n');
      
      await mongoose.connect(mongoUri);
      console.log('Connected to in-memory MongoDB');

      // Add debug endpoint to get database info
      app.get('/api/debug/db', async (req, res) => {
        try {
          const collections = await mongoose.connection.db.collections();
          const dbInfo = {
            uri: mongoUri,
            collections: await Promise.all(
              collections.map(async (collection) => ({
                name: collection.collectionName,
                count: await collection.countDocuments(),
                documents: await collection.find({}).toArray()
              }))
            )
          };
          res.json(dbInfo);
        } catch (error) {
          res.status(500).json({ error: 'Failed to get database info' });
        }
      });
    } else {
      // Use MongoDB Atlas in production
      const MONGODB_URI = process.env.MONGODB_URI;
      
      if (!MONGODB_URI) {
        throw new Error('MONGODB_URI is not defined in environment variables');
      }
      
      console.log('Connecting to MongoDB Atlas...');
      await mongoose.connect(MONGODB_URI);
      console.log('Connected to MongoDB Atlas');
    }

    // Seed database with sample products
    await seedDatabase();
    
    const server = await registerRoutes(app);

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      res.status(status).json({ message });
      throw err;
    });

    // importantly only setup vite in development and after
    // setting up all the other routes so the catch-all route
    // doesn't interfere with the other routes
    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    // ALWAYS serve the app on the port specified in the environment variable PORT
    // Other ports are firewalled. Default to 5000 if not specified.
    // this serves both the API and the client.
    // It is the only port that is not firewalled.
    const port = parseInt(process.env.PORT || '5000', 10);
    server.listen(port, 'localhost', () => {
      log(`serving on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
})();
