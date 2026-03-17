import 'dotenv/config';
import express from "express";
import path from "path";
import cors from "cors";
import { createServer as createViteServer } from "vite";
import invitationRoutes from "./routes/invitationRoutes.js";
import fs from 'fs-extra';

async function startServer() {
  const app = express();
  const PORT = 3000;

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

  console.log('NODE_ENV is:', process.env.NODE_ENV);
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
