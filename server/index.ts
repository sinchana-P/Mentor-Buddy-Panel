import express, { Request, Response, NextFunction } from "express";
import cors from "cors";

import { registerRoutes } from "./routes";
import { serveStatic, log } from "./vite";
import { config } from "./config";

import authRoutes from "./routes/authRoutes";
import resourceRoutes from "./routes/resourceRoutes";
import buddyRoutes from "./routes/buddyRoutes";
import mentorRoutes from "./routes/mentorRoutes";

const app = express();

// CORS Middleware
app.use(cors({
  origin: config.CORS_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Custom logging for API responses
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
  const server = await registerRoutes(app);

  // Global error handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });

  // Serve static files only in production
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  }

  // Register API routes
  app.use("/api/auth", authRoutes);
  app.use("/api/resources", resourceRoutes);
  app.use("/api/buddies", buddyRoutes);
  app.use("/api/mentors", mentorRoutes);

  // Final server start
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  server.listen(port, () => {
    log(`✅ Server is running on port ${port}`);
  });
})();
