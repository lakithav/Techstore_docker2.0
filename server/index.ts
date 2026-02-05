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
    // Check for MongoDB URI first (production/docker)
    const MONGODB_URI = process.env.MONGODB_URI;
    
    if (MONGODB_URI) {
      // Use provided MongoDB URI (Docker or Atlas)
      console.log('Connecting to MongoDB...');
      mongoUri = MONGODB_URI;
      await mongoose.connect(MONGODB_URI, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });
      console.log('Connected to MongoDB successfully');
      
      // Verify connection is working
      const adminDb = mongoose.connection.db.admin();
      const serverStatus = await adminDb.serverStatus();
      console.log(`MongoDB version: ${serverStatus.version}, uptime: ${serverStatus.uptime}s`);
    } else if (process.env.NODE_ENV === 'development') {
      // Use in-memory MongoDB only for local development
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      mongoUri = mongoServer.getUri();
      console.log('\n🔌 MongoDB Memory Server URL:', mongoUri);
      console.log('📝 You can use MongoDB Compass with this connection string to view the database\n');
      
      await mongoose.connect(mongoUri);
      console.log('Connected to in-memory MongoDB');
    } else {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    // Add debug endpoint to get database info
    app.get('/api/debug/db', async (req, res) => {
      try {
        console.log('Debug endpoint called, checking connection state:', mongoose.connection.readyState);
        
        if (mongoose.connection.readyState !== 1) {
          return res.status(503).json({ error: 'Database not connected', state: mongoose.connection.readyState });
        }
        
        const collections = await mongoose.connection.db.collections();
        console.log(`Found ${collections.length} collections`);
        
        const dbInfo = {
          uri: mongoUri ? mongoUri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@') : 'N/A', // Hide credentials
          connectionState: mongoose.connection.readyState,
          collections: await Promise.all(
            collections.map(async (collection) => ({
              name: collection.collectionName,
              count: await collection.countDocuments(),
              documents: await collection.find({}).limit(10).toArray()
            }))
          )
        };
        res.json(dbInfo);
      } catch (error) {
        console.error('Debug endpoint error:', error);
        res.status(500).json({ error: 'Failed to get database info', details: error instanceof Error ? error.message : String(error) });
      }
    });

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
    } else if (process.env.SERVE_STATIC === 'true') {
      // Only serve static files if explicitly enabled (not in Docker)
      serveStatic(app);
    }
    // In Docker, the frontend is served by a separate nginx container

    // ALWAYS serve the app on the port specified in the environment variable PORT
    // Other ports are firewalled. Default to 5000 if not specified.
    // this serves both the API and the client.
    // It is the only port that is not firewalled.
    const port = parseInt(process.env.PORT || '5000', 10);
    server.listen(port, '0.0.0.0', () => {
      log(`serving on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
})();
