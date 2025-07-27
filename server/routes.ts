import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertMentorSchema, 
  insertBuddySchema, 
  insertTaskSchema, 
  insertSubmissionSchema,
  insertTopicSchema,
  insertBuddyTopicProgressSchema
} from "server/shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // User routes
  app.get("/api/users", async (req, res) => {
    try {
      console.log('[GET /api/users] Fetching all users...');
      const users = await storage.getAllUsers();
      console.log('[GET /api/users] Users found:', users.length);
      res.json(users);
    } catch (error) {
      console.error('[GET /api/users] Error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      console.log(`[GET /api/users/${req.params.id}] Looking for user...`);
      const user = await storage.getUser(req.params.id);
      if (!user) {
        console.log(`[GET /api/users/${req.params.id}] User not found in storage`);
        return res.status(404).json({ message: "User not found" });
      }
      console.log(`[GET /api/users/${req.params.id}] User found:`, user);
      res.json(user);
    } catch (error) {
      console.error(`[GET /api/users/${req.params.id}] Error:`, error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      console.log('[POST /api/users] Creating user with data:', req.body);
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      console.log('[POST /api/users] User created successfully:', user);
      res.status(201).json(user);
    } catch (error: any) {
      console.error('[POST /api/users] Error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.issues });
      }
      if (error.code === 'DUPLICATE_EMAIL') {
        return res.status(409).json({ message: 'Email already exists' });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/users/:id", async (req, res) => {
    try {
      const updateData = req.body;
      const user = await storage.updateUser(req.params.id, updateData);
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Dashboard stats
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/dashboard/activity", async (req, res) => {
    try {
      const activity = await storage.getRecentActivity();
      res.json(activity);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Buddies routes
  app.get("/api/buddies", async (req, res) => {
    try {
      const { status, domain, search } = req.query;
      const buddies = await storage.getAllBuddies({
        status: status as string,
        domain: domain as string,
        search: search as string
      });
      res.json(buddies);
    } catch (error) {
      console.error('Error fetching buddies:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/buddies/:id", async (req, res) => {
    try {
      const buddy = await storage.getBuddyById(req.params.id);
      if (!buddy) {
        return res.status(404).json({ message: "Buddy not found" });
      }
      res.json(buddy);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/buddies", async (req, res) => {
    try {
      console.log('[POST /api/buddies] Creating new buddy:', req.body);
      const { name, email, domainRole } = req.body;
      
      // Create user first
      const user = await storage.createUser({
        email,
        name,
        role: 'buddy',
        domainRole
      });
      
      console.log('[POST /api/buddies] User created:', user.id);
      
      // Create buddy profile
      const buddy = await storage.createBuddy({
        userId: user.id,
        status: 'active'
      });
      
      console.log('[POST /api/buddies] Buddy created:', buddy.id);
      
      res.json({ 
        id: buddy.id,
        user: {
          name: user.name,
          email: user.email,
          avatarUrl: user.avatarUrl
        },
        mentor: null,
        domainRole: user.domainRole,
        status: buddy.status,
        startDate: buddy.joinDate.toISOString(),
        stats: {
          completedTasks: 0,
          totalTasks: 0
        }
      });
    } catch (error: any) {
      console.error('Error creating buddy:', error);
      if (error.code === 'DUPLICATE_EMAIL') {
        return res.status(409).json({ message: 'Email already exists' });
      }
      res.status(500).json({ message: 'Failed to create buddy' });
    }
  });

  app.get("/api/buddies/:id/tasks", async (req, res) => {
    try {
      const tasks = await storage.getBuddyTasks(req.params.id);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/buddies/:id/progress", async (req, res) => {
    try {
      const progress = await storage.getBuddyProgress(req.params.id);
      res.json(progress);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/buddies/:id/progress/:topicId", async (req, res) => {
    try {
      const { checked } = req.body;
      const progress = await storage.updateBuddyTopicProgress(req.params.id, req.params.topicId, checked);
      res.json(progress);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/buddies/:id/portfolio", async (req, res) => {
    try {
      const portfolio = await storage.getBuddyPortfolio(req.params.id);
      res.json(portfolio);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/buddies/:id/assign", async (req, res) => {
    try {
      const { mentorId } = req.body;
      const buddy = await storage.assignBuddyToMentor(req.params.id, mentorId);
      res.json(buddy);
    } catch (error) {
      console.error('Error assigning buddy to mentor:', error);
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
      console.log('[POST /api/tasks] Creating new task:', req.body);
      const { title, description, buddyId, dueDate } = req.body;
      
      const task = await storage.createTask({
        mentorId: "mentor-1", // This would be dynamic based on authenticated user
        buddyId,
        title,
        description,
        status: 'pending',
        dueDate: dueDate ? new Date(dueDate) : null
      });
      
      console.log('[POST /api/tasks] Task created:', task.id);
      
      res.json(task);
    } catch (error) {
      console.error('Error creating task:', error);
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
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Submissions routes
  app.post("/api/submissions", async (req, res) => {
    try {
      const submissionData = insertSubmissionSchema.parse(req.body);
      const submission = await storage.createSubmission(submissionData);
      res.status(201).json(submission);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid submission data", errors: error.issues });
      }
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
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/topics", async (req, res) => {
    try {
      const topicData = insertTopicSchema.parse(req.body);
      const topic = await storage.createTopic(topicData);
      res.status(201).json(topic);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid topic data", errors: error.issues });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Resources routes
  app.get("/api/resources", async (req, res) => {
    try {
      const { category, difficulty, type, search } = req.query;
      const resources = await storage.getAllResources({
        category: category as string,
        difficulty: difficulty as string,
        type: type as string,
        search: search as string
      });
      res.json(resources);
    } catch (error) {
      console.error('Error fetching resources:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/resources", async (req, res) => {
    try {
      console.log('[POST /api/resources] Creating new resource:', req.body);
      const resource = await storage.createResource(req.body);
      console.log('[POST /api/resources] Resource created:', resource.id);
      res.status(201).json(resource);
    } catch (error) {
      console.error('Error creating resource:', error);
      res.status(500).json({ message: 'Failed to create resource' });
    }
  });

  // Mentor routes
  app.get("/api/mentors", async (req, res) => {
    console.log('[GET /api/mentors] Fetching all mentors...');
    try {
      const { role, status, search } = req.query;
      const mentors = await storage.getMentors({
        role: role as string,
        status: status as string,
        search: search as string,
      });
      res.json(mentors);
    } catch (error: any) {
      res.status(500).json({
        message: "Internal server error",
        error: error?.message ?? error,
      });
    }
  });

  app.get("/api/mentors/:id", async (req, res) => {
    try {
      const mentor = await storage.getMentorById(req.params.id);
      if (!mentor) {
        return res.status(404).json({ message: "Mentor not found" });
      }
      res.json(mentor);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/mentors", async (req, res) => {
    try {
      const mentorData = insertMentorSchema.parse(req.body);
      const mentor = await storage.createMentor(mentorData);
      res.status(201).json(mentor);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid mentor data", errors: error.issues });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/mentors/:id", async (req, res) => {
    try {
      const updates = req.body;
      const mentor = await storage.updateMentor(req.params.id, updates);
      res.json(mentor);
    } catch (error) {
      console.error('Error updating mentor:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/mentors/:id/buddies", async (req, res) => {
    try {
      const { status } = req.query;
      const buddies = await storage.getMentorBuddies(req.params.id, status as string);
      res.json(buddies);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Buddy routes
  app.get("/api/buddies/:id", async (req, res) => {
    try {
      const buddy = await storage.getBuddyById(req.params.id);
      if (!buddy) {
        return res.status(404).json({ message: "Buddy not found" });
      }
      res.json(buddy);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/buddies/:id/tasks", async (req, res) => {
    try {
      const tasks = await storage.getBuddyTasks(req.params.id);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/buddies/:id/progress", async (req, res) => {
    try {
      const progress = await storage.getBuddyProgress(req.params.id);
      res.json(progress);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/buddies/:buddyId/progress/:topicId", async (req, res) => {
    try {
      const { checked } = req.body;
      const progress = await storage.updateBuddyTopicProgress(
        req.params.buddyId,
        req.params.topicId,
        checked
      );
      res.json(progress);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/buddies/:id/portfolio", async (req, res) => {
    try {
      const portfolio = await storage.getBuddyPortfolio(req.params.id);
      res.json(portfolio);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Task routes
  app.post("/api/tasks", async (req, res) => {
    try {
      const taskData = insertTaskSchema.parse(req.body);
      const task = await storage.createTask(taskData);
      res.status(201).json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid task data", errors: error.issues });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Submission routes
  app.post("/api/submissions", async (req, res) => {
    try {
      const submissionData = insertSubmissionSchema.parse(req.body);
      const submission = await storage.createSubmission(submissionData);
      res.status(201).json(submission);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid submission data", errors: error.issues });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Topic routes
  app.get("/api/topics", async (req, res) => {
    try {
      const { domainRole } = req.query;
      const topics = await storage.getTopics(domainRole as string);
      res.json(topics);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Mentor DELETE
  app.delete("/api/mentors/:id", async (req, res) => {
    try {
      await storage.deleteMentor(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Task PATCH (update)
  app.patch("/api/tasks/:id", async (req, res) => {
    try {
      const updates = req.body;
      const task = await storage.updateTask(req.params.id, updates);
      res.json(task);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Task DELETE
  app.delete("/api/tasks/:id", async (req, res) => {
    try {
      await storage.deleteTask(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
