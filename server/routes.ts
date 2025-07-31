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
import { insertCurriculumSchema } from "server/shared/curriculum-schema";
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
      const user = await storage.createUser(userData as any);
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
        userId: user.id as string,
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

  // Route moved to buddyRoutes.ts

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
      
      if (!mentorId) {
        return res.status(400).json({ message: "Mentor ID is required" });
      }
      
      // Validate buddy exists
      const existingBuddy = await storage.getBuddyById(req.params.id);
      if (!existingBuddy) {
        return res.status(404).json({ message: "Buddy not found" });
      }
      
      // Validate mentor exists
      const mentor = await storage.getMentorById(mentorId);
      if (!mentor) {
        return res.status(404).json({ message: "Mentor not found" });
      }
      
      const buddy = await storage.assignBuddyToMentor(req.params.id, mentorId);
      res.json(buddy);
    } catch (error) {
      console.error('Error assigning buddy to mentor:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Buddy PATCH (update)
  app.patch("/api/buddies/:id", async (req, res) => {
    try {
      const updates = req.body;
      // Validate that the buddy exists first
      const existingBuddy = await storage.getBuddyById(req.params.id);
      if (!existingBuddy) {
        return res.status(404).json({ message: "Buddy not found" });
      }
      
      const buddy = await storage.updateBuddy(req.params.id, updates);
      res.json(buddy);
    } catch (error) {
      console.error('Error updating buddy:', error);
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
      const taskData = insertTaskSchema.parse(req.body);
      const task = await storage.createTask(taskData);
      console.log('[POST /api/tasks] Task created:', task.id);
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
      const topic = await storage.createTopic(topicData as any);
      res.status(201).json(topic);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid topic data", errors: error.issues });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Resources routes are now handled by resourceRoutes.ts

  // Mentor routes are now handled by mentorRoutes.ts

  // Curriculum routes
  app.get("/api/curriculum", async (req, res) => {
    try {
      const { domain, search } = req.query;
      const curriculumItems = await storage.getAllCurriculum({
        domain: domain as string,
        search: search as string
      });
      res.json(curriculumItems);
    } catch (error) {
      console.error('Error fetching curriculum:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/curriculum/:id", async (req, res) => {
    try {
      const curriculumItem = await storage.getCurriculumById(req.params.id);
      if (!curriculumItem) {
        return res.status(404).json({ message: "Curriculum item not found" });
      }
      res.json(curriculumItem);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/curriculum", async (req, res) => {
    try {
      console.log('[POST /api/curriculum] Creating new curriculum item:', req.body);
      const curriculumData = insertCurriculumSchema.parse(req.body);
      const curriculumItem = await storage.createCurriculum(curriculumData);
      console.log('[POST /api/curriculum] Curriculum item created:', curriculumItem.id);
      res.status(201).json(curriculumItem);
    } catch (error) {
      console.error('Error creating curriculum item:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid curriculum data", errors: error.issues });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/curriculum/:id", async (req, res) => {
    try {
      const updates = req.body;
      const curriculumItem = await storage.updateCurriculum(req.params.id, updates);
      res.json(curriculumItem);
    } catch (error) {
      console.error('Error updating curriculum item:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/curriculum/:id", async (req, res) => {
    try {
      await storage.deleteCurriculum(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting curriculum item:', error);
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

  // Route moved to buddyRoutes.ts

  app.get("/api/buddies/:id/portfolio", async (req, res) => {
    try {
      const portfolio = await storage.getBuddyPortfolio(req.params.id);
      res.json(portfolio);
    } catch (error) {
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

  // Mentor DELETE - handled by mentorRoutes.ts

  // Task PATCH (update)
  app.patch("/api/tasks/:id", async (req, res) => {
    try {
      const updates = req.body;
      // Validate that the task exists first
      const existingTask = await storage.getTaskById(req.params.id);
      if (!existingTask) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      const task = await storage.updateTask(req.params.id, updates);
      res.json(task);
    } catch (error) {
      console.error('Error updating task:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Task DELETE
  app.delete("/api/tasks/:id", async (req, res) => {
    try {
      // Validate that the task exists first
      const existingTask = await storage.getTaskById(req.params.id);
      if (!existingTask) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      await storage.deleteTask(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting task:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Task assignment to buddy (PATCH /api/tasks/:id/assign)
  app.patch("/api/tasks/:id/assign", async (req, res) => {
    try {
      const { buddyId } = req.body;
      
      if (!buddyId) {
        return res.status(400).json({ message: "Buddy ID is required" });
      }
      
      // Validate task exists
      const existingTask = await storage.getTaskById(req.params.id);
      if (!existingTask) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      // Validate buddy exists
      const buddy = await storage.getBuddyById(buddyId);
      if (!buddy) {
        return res.status(404).json({ message: "Buddy not found" });
      }
      
      // Update the task's buddy assignment
      const task = await storage.updateTask(req.params.id, { buddyId });
      res.json(task);
    } catch (error) {
      console.error('Error assigning task to buddy:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
