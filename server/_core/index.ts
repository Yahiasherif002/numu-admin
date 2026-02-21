import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { COOKIE_NAME } from "@shared/const";
import { sdk } from "./sdk";
import * as db from "../db";

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

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);

  // Dev login — bypasses OAuth for local development
  if (process.env.NODE_ENV === "development") {
    app.get("/api/dev-login", async (_req, res) => {
      try {
        const openId = "dev-admin-local";
        await db.upsertUser({
          openId,
          name: "Dev Admin",
          email: "dev@admin.local",
          role: "admin",
          lastSignedIn: new Date(),
        });
        const token = await sdk.createSessionToken(openId, { name: "Dev Admin" });
        res.cookie(COOKIE_NAME, token, {
          httpOnly: true,
          sameSite: "lax",
          path: "/",
          maxAge: 365 * 24 * 60 * 60 * 1000,
        });
        res.redirect("/");
      } catch (error) {
        console.error("[Dev Login] Error:", error);
        res.status(500).json({ error: "Dev login failed. Is the local MySQL database running?" });
      }
    });
    console.log("[Dev] Dev login available at /api/dev-login");
  }

  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
