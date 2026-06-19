import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import type { Express } from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import adminRoutes from "../adminRoutes";
import { sdk } from "./sdk";
// Die Migration-Imports werden hier nicht mehr benötigt:
// import { migrate } from "drizzle-orm/node-postgres/migrator";
// import { drizzle } from "drizzle-orm/node-postgres";
import fs from "fs";
import path from "path";
import { initializeDatabase } from "../db-init";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

// runMigrations ist jetzt deaktiviert, da wir die DB manuell in Supabase verwalten
/*
async function runMigrations() {
  if (!process.env.DATABASE_URL) {
    console.log("[Database] DATABASE_URL not set, skipping migrations");
    return;
  }
  try {
    console.log("[Database] Starting migrations...");
    const db = drizzle(process.env.DATABASE_URL);
    const migrationsFolder = path.resolve(process.cwd(), "drizzle");
    await migrate(db, { migrationsFolder });
    console.log("[Database] Migrations completed successfully! ✅");
  } catch (error) {
    console.warn("[Database] Migration warning:", error instanceof Error ? error.message : error);
  }
}
*/

async function startServer() {
  // Run migrations ist auskommentiert:
  // await runMigrations();

  // Initialize database with CSV data (Falls dies auch fehlerhafte Tabellen-Erstellung versucht, ggf. auch hier prüfen!)
  await initializeDatabase();

  const app: Express = express();
  const server = createServer(app);
  
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
    } else {
      next();
    }
  });
  
  registerStorageProxy(app);
  registerOAuthRoutes(app);

  app.post("/api/scheduled/keepalive", async (req, res) => {
    try {
      const user = await sdk.authenticateRequest(req);
      if (!user.isCron) {
        return res.status(403).json({ error: "cron-only" });
      }
      res.json({ ok: true, timestamp: new Date().toISOString() });
    } catch (error) {
      res.status(500).json({ error: "error" });
    }
  });

  app.use("/api/admin", adminRoutes);
  
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
