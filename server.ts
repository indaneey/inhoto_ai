import 'dotenv/config';
import express from "express";
import path from "path";
import cors from "cors";
import invitationRoutes from "./routes/invitationRoutes.js";
import fs from 'fs-extra';
import sharp from 'sharp';

// Optimize sharp for lower CPU usage in resource-constrained environments
sharp.concurrency(1);

async function startServer() {
  const app = express();
  const PORT = 4000;

  // Ensure public directories exist
  await fs.ensureDir(path.join(process.cwd(), 'public', 'images'));

  app.use(cors());
  app.use(express.json());
  app.use(express.static(path.join(process.cwd(), 'public')));

  // API routes
  app.use('/api', invitationRoutes);

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  const isProduction = process.env.NODE_ENV === "production";
  console.log(`Starting server in ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'} mode...`);

  if (!isProduction) {
    // Only load Vite in development to save CPU/Memory
    console.log('Initializing Vite Dev Server...');
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    if (await fs.pathExists(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    } else {
      console.warn('Production build (dist/) not found. Static files will not be served.');
    }
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
