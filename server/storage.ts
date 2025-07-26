import { 
  type User, 
  type InsertUser, 
  type Mentor, 
  type InsertMentor,
  type Buddy,
  type InsertBuddy,
  type Task,
  type InsertTask,
  type Submission,
  type InsertSubmission,
  type Topic,
  type InsertTopic,
  type BuddyTopicProgress,
  type InsertBuddyTopicProgress
} from "@shared/schema";
import { randomUUID } from "crypto";

// Extended interface with all CRUD methods needed for the mentoring platform
export interface IStorage {
  // User management
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;

  // Dashboard
  getDashboardStats(): Promise<any>;
  getRecentActivity(): Promise<any[]>;

  // Mentor management
  getMentors(filters: { role?: string; status?: string; search?: string }): Promise<any[]>;
  getMentorById(id: string): Promise<any>;
  createMentor(mentor: InsertMentor): Promise<Mentor>;
  getMentorBuddies(mentorId: string, status?: string): Promise<any[]>;

  // Buddy management
  getBuddyById(id: string): Promise<any>;
  createBuddy(buddy: InsertBuddy): Promise<Buddy>;
  getBuddyTasks(buddyId: string): Promise<any[]>;
  getBuddyProgress(buddyId: string): Promise<any>;
  updateBuddyTopicProgress(buddyId: string, topicId: string, checked: boolean): Promise<any>;
  getBuddyPortfolio(buddyId: string): Promise<any[]>;

  // Task management
  createTask(task: InsertTask): Promise<Task>;
  getTaskById(id: string): Promise<Task | undefined>;

  // Submission management
  createSubmission(submission: InsertSubmission): Promise<Submission>;

  // Topic management
  getTopics(domainRole?: string): Promise<Topic[]>;
  createTopic(topic: InsertTopic): Promise<Topic>;

  // Progress tracking
  createBuddyTopicProgress(progress: InsertBuddyTopicProgress): Promise<BuddyTopicProgress>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private mentors: Map<string, Mentor>;
  private buddies: Map<string, Buddy>;
  private tasks: Map<string, Task>;
  private submissions: Map<string, Submission>;
  private topics: Map<string, Topic>;
  private buddyTopicProgress: Map<string, BuddyTopicProgress>;

  constructor() {
    this.users = new Map();
    this.mentors = new Map();
    this.buddies = new Map();
    this.tasks = new Map();
    this.submissions = new Map();
    this.topics = new Map();
    this.buddyTopicProgress = new Map();

    // Initialize with some default topics for each domain
    this.initializeDefaultTopics();
  }

  private initializeDefaultTopics() {
    const defaultTopics = [
      // Frontend topics
      { name: "React Fundamentals", category: "Framework", domainRole: "frontend" },
      { name: "TypeScript Basics", category: "Language", domainRole: "frontend" },
      { name: "Component Architecture", category: "Design Patterns", domainRole: "frontend" },
      { name: "State Management", category: "Data Flow", domainRole: "frontend" },
      { name: "Testing Strategies", category: "Quality Assurance", domainRole: "frontend" },
      { name: "Performance Optimization", category: "Performance", domainRole: "frontend" },

      // Backend topics
      { name: "Node.js Fundamentals", category: "Runtime", domainRole: "backend" },
      { name: "Database Design", category: "Data", domainRole: "backend" },
      { name: "API Development", category: "Integration", domainRole: "backend" },
      { name: "Authentication & Authorization", category: "Security", domainRole: "backend" },
      { name: "Error Handling", category: "Reliability", domainRole: "backend" },
      { name: "Microservices Architecture", category: "Architecture", domainRole: "backend" },

      // DevOps topics
      { name: "Docker Containerization", category: "Containers", domainRole: "devops" },
      { name: "Kubernetes Orchestration", category: "Orchestration", domainRole: "devops" },
      { name: "CI/CD Pipelines", category: "Automation", domainRole: "devops" },
      { name: "Infrastructure as Code", category: "IaC", domainRole: "devops" },
      { name: "Monitoring & Logging", category: "Observability", domainRole: "devops" },
      { name: "Cloud Platform Management", category: "Cloud", domainRole: "devops" },

      // QA topics
      { name: "Test Planning", category: "Strategy", domainRole: "qa" },
      { name: "Automated Testing", category: "Automation", domainRole: "qa" },
      { name: "Bug Tracking", category: "Process", domainRole: "qa" },
      { name: "Performance Testing", category: "Performance", domainRole: "qa" },
      { name: "Security Testing", category: "Security", domainRole: "qa" },
      { name: "User Acceptance Testing", category: "Validation", domainRole: "qa" },

      // HR topics
      { name: "Recruitment Process", category: "Hiring", domainRole: "hr" },
      { name: "Employee Onboarding", category: "Integration", domainRole: "hr" },
      { name: "Performance Management", category: "Evaluation", domainRole: "hr" },
      { name: "Team Building", category: "Culture", domainRole: "hr" },
      { name: "Conflict Resolution", category: "Management", domainRole: "hr" },
      { name: "Policy Development", category: "Governance", domainRole: "hr" },
    ];

    defaultTopics.forEach(topic => {
      const id = randomUUID();
      this.topics.set(id, { 
        id, 
        ...topic,
        domainRole: topic.domainRole as "frontend" | "backend" | "devops" | "qa" | "hr"
      });
    });
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    console.log(`[MemStorage] Looking for user ID: ${id}, total users: ${this.users.size}`);
    const user = this.users.get(id);
    console.log(`[MemStorage] User found:`, user ? 'YES' : 'NO');
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = insertUser.id || randomUUID();
    const user: User = { 
      ...insertUser, 
      id,
      domainRole: insertUser.domainRole || null,
      avatarUrl: insertUser.avatarUrl || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    console.log(`[MemStorage] Storing user with ID: ${id}`, user);
    this.users.set(id, user);
    console.log(`[MemStorage] Total users in storage: ${this.users.size}`);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const user = this.users.get(id);
    if (!user) {
      throw new Error("User not found");
    }
    const updatedUser = { 
      ...user, 
      ...updates, 
      updatedAt: new Date() 
    };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Dashboard methods
  async getDashboardStats(): Promise<any> {
    const mentors = Array.from(this.mentors.values());
    const buddies = Array.from(this.buddies.values());
    const tasks = Array.from(this.tasks.values());
    
    const totalMentors = mentors.length;
    const activeBuddies = buddies.filter(b => b.status === 'active').length;
    const weeklyTasks = tasks.filter(t => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(t.createdAt) > weekAgo;
    }).length;
    
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const completionRate = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

    return {
      totalMentors,
      activeBuddies,
      weeklyTasks,
      completionRate,
      mentors: {
        total: totalMentors,
        active: mentors.filter(m => m.isActive).length
      },
      buddies: {
        total: buddies.length,
        active: activeBuddies
      },
      analytics: {
        reports: 12,
        growth: '+15%'
      }
    };
  }

  async getRecentActivity(): Promise<any[]> {
    const activities = [];
    const tasks = Array.from(this.tasks.values()).slice(-5);
    
    for (const task of tasks) {
      const mentor = this.mentors.get(task.mentorId);
      const buddy = this.buddies.get(task.buddyId);
      const mentorUser = mentor ? this.users.get(mentor.userId) : null;
      const buddyUser = buddy ? this.users.get(buddy.userId) : null;

      if (mentorUser && buddyUser) {
        activities.push({
          mentorName: mentorUser.name,
          buddyName: buddyUser.name,
          action: "assigned a new task to",
          timestamp: `${Math.floor(Math.random() * 12) + 1} hours ago`,
          type: "Task Assigned"
        });
      }
    }

    return activities.length > 0 ? activities : [];
  }

  // Mentor methods
  async getMentors(filters: { role?: string; status?: string; search?: string }): Promise<any[]> {
    let mentors = Array.from(this.mentors.values());
    
    // Filter by role
    if (filters.role && filters.role !== 'all') {
      mentors = mentors.filter(mentor => {
        const user = this.users.get(mentor.userId);
        return user?.domainRole === filters.role;
      });
    }
    
    // Filter by status
    if (filters.status && filters.status !== 'all') {
      const isActive = filters.status === 'active';
      mentors = mentors.filter(mentor => mentor.isActive === isActive);
    }
    
    // Filter by search
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      mentors = mentors.filter(mentor => {
        const user = this.users.get(mentor.userId);
        return user?.name.toLowerCase().includes(searchTerm) ||
               mentor.expertise.toLowerCase().includes(searchTerm);
      });
    }

    // Enrich with user data and stats
    return mentors.map(mentor => {
      const user = this.users.get(mentor.userId);
      const buddiesCount = Array.from(this.buddies.values())
        .filter(buddy => buddy.assignedMentorId === mentor.id).length;
      const completedTasks = Array.from(this.tasks.values())
        .filter(task => task.mentorId === mentor.id && task.status === 'completed').length;

      return {
        ...mentor,
        user,
        stats: {
          buddiesCount,
          completedTasks
        }
      };
    });
  }

  async getMentorById(id: string): Promise<any> {
    const mentor = this.mentors.get(id);
    if (!mentor) return null;

    const user = this.users.get(mentor.userId);
    const assignedBuddies = Array.from(this.buddies.values())
      .filter(buddy => buddy.assignedMentorId === id);
    
    const totalBuddies = assignedBuddies.length;
    const activeBuddies = assignedBuddies.filter(buddy => buddy.status === 'active').length;
    const completedTasks = Array.from(this.tasks.values())
      .filter(task => task.mentorId === id && task.status === 'completed').length;

    return {
      ...mentor,
      user,
      stats: {
        totalBuddies,
        activeBuddies,
        completedTasks,
        avgRating: 4.8
      }
    };
  }

  async createMentor(insertMentor: InsertMentor): Promise<Mentor> {
    const id = randomUUID();
    const mentor: Mentor = {
      ...insertMentor,
      id,
      responseRate: insertMentor.responseRate || null,
      isActive: insertMentor.isActive || null,
      createdAt: new Date()
    };
    this.mentors.set(id, mentor);
    return mentor;
  }

  async getMentorBuddies(mentorId: string, status?: string): Promise<any[]> {
    let buddies = Array.from(this.buddies.values())
      .filter(buddy => buddy.assignedMentorId === mentorId);

    if (status && status !== 'all') {
      buddies = buddies.filter(buddy => buddy.status === status);
    }

    return buddies.map(buddy => {
      const user = this.users.get(buddy.userId);
      const mentor = this.mentors.get(buddy.assignedMentorId!);
      const mentorUser = mentor ? this.users.get(mentor.userId) : null;
      
      const buddyTasks = Array.from(this.tasks.values())
        .filter(task => task.buddyId === buddy.id);
      const completedTasks = buddyTasks.filter(task => task.status === 'completed').length;

      return {
        ...buddy,
        user,
        mentor: mentor ? { ...mentor, user: mentorUser } : null,
        stats: {
          completedTasks,
          totalTasks: buddyTasks.length
        }
      };
    });
  }

  // Buddy methods
  async getBuddyById(id: string): Promise<any> {
    const buddy = this.buddies.get(id);
    if (!buddy) return null;

    const user = this.users.get(buddy.userId);
    const mentor = buddy.assignedMentorId ? this.mentors.get(buddy.assignedMentorId) : null;
    const mentorUser = mentor ? this.users.get(mentor.userId) : null;

    return {
      ...buddy,
      user,
      mentor: mentor ? { ...mentor, user: mentorUser } : null
    };
  }

  async createBuddy(insertBuddy: InsertBuddy): Promise<Buddy> {
    const id = randomUUID();
    const buddy: Buddy = {
      ...insertBuddy,
      id,
      assignedMentorId: insertBuddy.assignedMentorId || null,
      status: insertBuddy.status || null,
      progress: insertBuddy.progress || null,
      joinDate: insertBuddy.joinDate || new Date(),
      createdAt: new Date()
    };
    this.buddies.set(id, buddy);
    return buddy;
  }

  async getBuddyTasks(buddyId: string): Promise<any[]> {
    const tasks = Array.from(this.tasks.values())
      .filter(task => task.buddyId === buddyId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return Promise.all(tasks.map(async task => {
      const submissions = Array.from(this.submissions.values())
        .filter(submission => submission.taskId === task.id);
      
      return {
        ...task,
        submissions
      };
    }));
  }

  async getBuddyProgress(buddyId: string): Promise<any> {
    const buddy = this.buddies.get(buddyId);
    if (!buddy) return { topics: [], percentage: 0 };

    const user = this.users.get(buddy.userId);
    if (!user?.domainRole) return { topics: [], percentage: 0 };

    const domainTopics = Array.from(this.topics.values())
      .filter(topic => topic.domainRole === user.domainRole);

    const progressEntries = Array.from(this.buddyTopicProgress.values())
      .filter(progress => progress.buddyId === buddyId);

    const topics = domainTopics.map(topic => {
      const progress = progressEntries.find(p => p.topicId === topic.id);
      return {
        id: topic.id,
        name: topic.name,
        checked: progress?.checked || false
      };
    });

    const completedCount = topics.filter(topic => topic.checked).length;
    const percentage = topics.length > 0 ? Math.round((completedCount / topics.length) * 100) : 0;

    return { topics, percentage };
  }

  async updateBuddyTopicProgress(buddyId: string, topicId: string, checked: boolean): Promise<any> {
    const existingProgress = Array.from(this.buddyTopicProgress.values())
      .find(progress => progress.buddyId === buddyId && progress.topicId === topicId);

    if (existingProgress) {
      const updated = {
        ...existingProgress,
        checked,
        completedAt: checked ? new Date() : null
      };
      this.buddyTopicProgress.set(existingProgress.id, updated);
      return updated;
    } else {
      const id = randomUUID();
      const newProgress: BuddyTopicProgress = {
        id,
        buddyId,
        topicId,
        checked,
        completedAt: checked ? new Date() : null
      };
      this.buddyTopicProgress.set(id, newProgress);
      return newProgress;
    }
  }

  async getBuddyPortfolio(buddyId: string): Promise<any[]> {
    const submissions = Array.from(this.submissions.values())
      .filter(submission => submission.buddyId === buddyId);

    return Promise.all(submissions.map(async submission => {
      const task = this.tasks.get(submission.taskId);
      return {
        id: submission.id,
        title: task?.title || 'Unknown Task',
        description: submission.notes,
        githubLink: submission.githubLink,
        deployedUrl: submission.deployedUrl,
        completedAt: submission.createdAt,
        technologies: [] // Could be extracted from task or submission data
      };
    }));
  }

  // Task methods
  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = randomUUID();
    const task: Task = {
      ...insertTask,
      id,
      dueDate: insertTask.dueDate || null,
      status: insertTask.status || null,
      createdAt: new Date()
    };
    this.tasks.set(id, task);
    return task;
  }

  async getTaskById(id: string): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  // Submission methods
  async createSubmission(insertSubmission: InsertSubmission): Promise<Submission> {
    const id = randomUUID();
    const submission: Submission = {
      ...insertSubmission,
      id,
      githubLink: insertSubmission.githubLink || null,
      deployedUrl: insertSubmission.deployedUrl || null,
      notes: insertSubmission.notes || null,
      feedback: insertSubmission.feedback || null,
      createdAt: new Date()
    };
    this.submissions.set(id, submission);
    return submission;
  }

  // Topic methods
  async getTopics(domainRole?: string): Promise<Topic[]> {
    let topics = Array.from(this.topics.values());
    
    if (domainRole) {
      topics = topics.filter(topic => topic.domainRole === domainRole);
    }
    
    return topics;
  }

  async createTopic(insertTopic: InsertTopic): Promise<Topic> {
    const id = randomUUID();
    const topic: Topic = { ...insertTopic, id };
    this.topics.set(id, topic);
    return topic;
  }

  // Progress tracking methods
  async createBuddyTopicProgress(insertProgress: InsertBuddyTopicProgress): Promise<BuddyTopicProgress> {
    const id = randomUUID();
    const progress: BuddyTopicProgress = { 
      ...insertProgress, 
      id,
      checked: insertProgress.checked || null,
      completedAt: insertProgress.completedAt || null
    };
    this.buddyTopicProgress.set(id, progress);
    return progress;
  }
}

import { DbStorage } from './db-storage';

// Initialize storage with fallback mechanism
async function initializeStorage(): Promise<IStorage> {
  // For now, use memory storage until database connection is properly configured
  console.log('[Storage] Using memory storage (database connection pending)');
  const memStorage = new MemStorage();
  
  // Initialize with some test data for demonstration
  const testUser = await memStorage.createUser({
    id: '1a11c298-2293-4654-ab53-bdc648218570',
    email: 'test@example.com',
    name: 'Test User',
    role: 'mentor',
    domainRole: 'frontend',
    createdAt: new Date()
  });
  
  await memStorage.createMentor({
    id: 'mentor-1',
    userId: testUser.id,
    bio: 'Experienced frontend developer',
    expertise: ['React', 'TypeScript', 'JavaScript'],
    responseRate: 95,
    isActive: true
  });
  
  console.log('[Storage] Initialized with test data');
  return memStorage;
}

// Create storage instance
let storage: IStorage = new MemStorage();

// Initialize storage asynchronously
initializeStorage().then(initializedStorage => {
  storage = initializedStorage;
}).catch(error => {
  console.error('[Storage] Failed to initialize storage:', error);
});

export { storage };
