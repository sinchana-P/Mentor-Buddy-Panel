import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { createServer } from "http";

import { log } from "./vite";
import { config } from "./config";
import { storage } from "./storage";

import authRoutes from "./routes/authRoutes";
import resourceRoutes from "./routes/resourceRoutes";
import buddyRoutes from "./routes/buddyRoutes";
import mentorRoutes from "./routes/mentorRoutes";

// Import schemas for the main route handlers
import { 
  insertUserSchema, 
  insertTaskSchema, 
  insertSubmissionSchema,
  insertTopicSchema,
  insertCurriculumSchema
} from "./shared/schema";
import { z } from "zod";

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

// Health check endpoint - register early
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "healthy", 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: "1.0.0"
  });
});

// Basic route for root path
app.get("/", (req, res) => {
  res.json({ 
    message: "Mentor Buddy Panel API",
    status: "running",
    timestamp: new Date().toISOString()
  });
});

// User routes
app.get("/api/users", async (req, res) => {
  try {
    const users = await storage.getAllUsers();
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/api/users/:id", async (req, res) => {
  try {
    const user = await storage.getUser(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/api/users", async (req, res) => {
  try {
    const userData = insertUserSchema.parse(req.body);
    const user = await storage.createUser(userData as any);
    res.status(201).json(user);
  } catch (error: any) {
    console.error('Error creating user:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid user data", errors: error.issues });
    }
    if (error.code === 'DUPLICATE_EMAIL') {
      return res.status(409).json({ message: 'Email already exists' });
    }
    res.status(500).json({ message: "Internal server error" });
  }
});

// Dashboard routes
app.get("/api/dashboard/stats", async (req, res) => {
  try {
    const stats = await storage.getDashboardStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/api/dashboard/activity", async (req, res) => {
  try {
    const activity = await storage.getRecentActivity();
    res.json(activity);
  } catch (error) {
    console.error('Error fetching dashboard activity:', error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Tasks routes
app.get("/api/tasks", async (req, res) => {
  try {
    const { status, search, buddyId } = req.query;
    const tasks = await storage.getAllTasks({
      status: status as string,
      search: search as string,
      buddyId: buddyId as string
    });
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/api/tasks", async (req, res) => {
  try {
    const taskData = insertTaskSchema.parse(req.body);
    const task = await storage.createTask(taskData);
    res.status(201).json(task);
  } catch (error) {
    console.error('Error creating task:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid task data", errors: error.issues });
    }
    res.status(500).json({ message: 'Failed to create task' });
  }
});

app.get("/api/tasks/:id", async (req, res) => {
  try {
    const task = await storage.getTaskById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.json(task);
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Topics routes
app.get("/api/topics", async (req, res) => {
  try {
    const { domain } = req.query;
    const topics = await storage.getTopics(domain as string);
    res.json(topics);
  } catch (error) {
    console.error('Error fetching topics:', error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/api/topics", async (req, res) => {
  try {
    const topicData = insertTopicSchema.parse(req.body);
    const topic = await storage.createTopic(topicData as any);
    res.status(201).json(topic);
  } catch (error) {
    console.error('Error creating topic:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid topic data", errors: error.issues });
    }
    res.status(500).json({ message: "Internal server error" });
  }
});

// Register API routes
app.use("/api/auth", authRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/buddies", buddyRoutes);
app.use("/api/mentors", mentorRoutes);

// Global error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message });
  log(`Error: ${status} - ${message}`);
});

// Start server
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
app.listen(port, "0.0.0.0", () => {
  log(`✅ Server is running on port ${port}`);
  log(`🔗 Environment: ${process.env.NODE_ENV || 'development'}`);
  log(`🌐 CORS Origins: ${JSON.stringify(config.CORS_ORIGIN)}`);
});
