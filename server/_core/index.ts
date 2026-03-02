import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import rateLimit from "express-rate-limit";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { csrfTokenHandler } from "./csrf";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";

/** Strict rate limiter for authentication endpoints (login, OAuth). */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: { error: "Too many login attempts. Try again in 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

/** General rate limiter for all API endpoints. */
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  message: { error: "Too many requests. Please slow down." },
  standardHeaders: true,
  legacyHeaders: false,
});

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
  // Body parser — 5 MB limit (down from 50 MB to prevent DoS via large payloads)
  app.use(express.json({ limit: "5mb" }));
  app.use(express.urlencoded({ limit: "5mb", extended: true }));

  // General API rate limiter — applies to all /api routes
  app.use("/api", apiLimiter);

  // Auth rate limiter — strict limits on login and OAuth endpoints.
  // tRPC uses httpBatchLink, so the URL may contain comma-separated
  // procedure names (e.g. /api/trpc/auth.login,auth.logout).
  // A plain app.use("/api/trpc/auth.login") wouldn't match batched paths,
  // so we inspect the URL segments manually.
  app.use("/api/trpc", (req, res, next) => {
    const procedures = req.path.slice(1).split(",");
    if (procedures.includes("auth.login")) {
      return authLimiter(req, res, next);
    }
    next();
  });
  app.use("/api/oauth/callback", authLimiter);

  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);

  // CSRF token endpoint
  app.get("/api/csrf-token", csrfTokenHandler);

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
