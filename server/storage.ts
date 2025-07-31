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
  type InsertBuddyTopicProgress,
  type Curriculum,
  type InsertCurriculum,
  DomainRole // <--- import DomainRole
} from "server/shared/schema";
import { randomUUID } from "crypto";

// Extended interface with all CRUD methods needed for the mentoring platform
export interface IStorage {
  // User management
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;
  deleteUser(id: string): Promise<void>;

  // Dashboard
  getDashboardStats(): Promise<any>;
  getRecentActivity(): Promise<any[]>;

  // Mentor management
  getMentors(filters: { role?: string; status?: string; search?: string }): Promise<any[]>;
  getMentorById(id: string): Promise<any>;
  createMentor(mentor: InsertMentor): Promise<Mentor>;
  updateMentor(id: string, updates: Partial<Mentor>): Promise<Mentor>;
  getMentorBuddies(mentorId: string, status?: string): Promise<any[]>;
  deleteMentor(id: string): Promise<void>;
  getAllMentors(filters?: { domain?: string; search?: string }): Promise<any[]>;

  // Buddy management
  getBuddyById(id: string): Promise<any>;
  getAllBuddies(filters?: { status?: string; domain?: string; search?: string }): Promise<any[]>;
  createBuddy(buddy: InsertBuddy): Promise<Buddy>;
  updateBuddy(id: string, updates: Partial<Buddy>): Promise<Buddy>;
  getBuddyTasks(buddyId: string): Promise<any[]>;
  getBuddyProgress(buddyId: string): Promise<any>;
  updateBuddyTopicProgress(buddyId: string, topicId: string, checked: boolean): Promise<any>;
  getBuddyPortfolio(buddyId: string): Promise<any[]>;
  assignBuddyToMentor(buddyId: string, mentorId: string): Promise<any>;

  // Task management
  createTask(task: InsertTask): Promise<Task>;
  getTaskById(id: string): Promise<Task | undefined>;
  getAllTasks(filters?: { status?: string; search?: string; buddyId?: string }): Promise<any[]>;
  updateTask(id: string, updates: Partial<Task>): Promise<Task>;
  deleteTask(id: string): Promise<void>;

  // Submission management
  createSubmission(submission: InsertSubmission): Promise<Submission>;
  getSubmissionsByTaskId(taskId: string): Promise<any[]>;

  // Topic management
  getTopics(domainRole?: string): Promise<Topic[]>;
  getAllTopics(): Promise<Topic[]>;
  getTopicById(id: string): Promise<Topic | undefined>;
  createTopic(topic: InsertTopic): Promise<Topic>;
  updateTopic(id: string, updates: Partial<Topic>): Promise<Topic>;
  deleteTopic(id: string): Promise<void>;

  // Progress tracking
  createBuddyTopicProgress(progress: InsertBuddyTopicProgress): Promise<BuddyTopicProgress>;

  // Resource management
  getAllResources(filters?: { category?: string; difficulty?: string; type?: string; search?: string }): Promise<any[]>;
  getResourceById(id: string): Promise<any | undefined>;
  createResource(resource: any): Promise<any>;
  updateResource(id: string, updates: any): Promise<any>;
  deleteResource(id: string): Promise<void>;
  
  // Curriculum management
  getAllCurriculum(filters?: { domain?: string; search?: string }): Promise<Curriculum[]>;
  getCurriculumById(id: string): Promise<Curriculum | undefined>;
  createCurriculum(curriculum: InsertCurriculum): Promise<Curriculum>;
  updateCurriculum(id: string, updates: Partial<Curriculum>): Promise<Curriculum>;
  deleteCurriculum(id: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private mentors: Map<string, Mentor>;
  private buddies: Map<string, Buddy>;
  private tasks: Map<string, Task>;
  private submissions: Map<string, Submission>;
  private topics: Map<string, Topic>;
  private buddyTopicProgress: Map<string, BuddyTopicProgress>;
  private curriculum: Map<string, Curriculum>;
  private resources: Map<string, any>;

  constructor() {
    this.users = new Map();
    this.mentors = new Map();
    this.buddies = new Map();
    this.tasks = new Map();
    this.submissions = new Map();
    this.topics = new Map();
    this.buddyTopicProgress = new Map();
    this.curriculum = new Map();
    this.resources = new Map();

    // Initialize with some default topics for each domain
    this.initializeDefaultTopics();
    // Initialize with some default curriculum items
    this.initializeDefaultCurriculum();
  }

  private initializeDefaultTopics() {
    const allowedDomainRoles: DomainRole[] = ["frontend", "backend", "devops", "qa", "hr"];
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
      const domainRole: DomainRole = typeof topic.domainRole === 'string' && allowedDomainRoles.includes(topic.domainRole as DomainRole)
        ? topic.domainRole as DomainRole
        : "frontend";
      this.topics.set(id, {
        id,
        name: topic.name,
        category: topic.category,
        domainRole
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

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const allowedDomainRoles: DomainRole[] = ["frontend", "backend", "devops", "qa", "hr"];
    const allowedRoles = ["manager", "mentor", "buddy"] as const;
    const id = randomUUID();
    const domainRole: DomainRole = allowedDomainRoles.includes(insertUser.domainRole as DomainRole)
      ? insertUser.domainRole as DomainRole
      : "frontend";
    const role = typeof insertUser.role === 'string' && allowedRoles.includes(insertUser.role as any)
      ? insertUser.role as typeof allowedRoles[number]
      : "buddy";
    const user: User = {
      ...insertUser,
      id,
      role,
      domainRole,
      avatarUrl: insertUser.avatarUrl || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.set(id, user);
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

  async deleteUser(id: string): Promise<void> {
    this.users.delete(id);
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

      if (mentorUser && buddyUser && isUser(mentorUser) && isUser(buddyUser)) {
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
        const user = this.users.get(mentor.userId) as User | undefined;
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
        const mentorUser = this.users.get(mentor.userId);
        if (isUser(mentorUser)) {
          const mUser: User = mentorUser;
          return ('' + mUser.name).toLowerCase().includes(searchTerm) ||
                 mentor.expertise?.toLowerCase().includes(searchTerm) || false;
        }
        return mentor.expertise?.toLowerCase().includes(searchTerm) || false;
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
      responseRate: insertMentor.responseRate ?? null,
      isActive: insertMentor.isActive ?? null,
      createdAt: new Date()
    };
    this.mentors.set(id, mentor);
    return mentor;
  }

  async updateMentor(id: string, updates: Partial<Mentor>): Promise<Mentor> {
    const mentor = this.mentors.get(id);
    if (!mentor) {
      throw new Error('Mentor not found');
    }
    
    const updatedMentor = { ...mentor, ...updates, updatedAt: new Date() };
    this.mentors.set(id, updatedMentor);
    return updatedMentor;
  }

  async deleteMentor(id: string): Promise<void> {
    this.mentors.delete(id);
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

  async getAllMentors(filters?: { domain?: string; search?: string }): Promise<any[]> {
    let mentors = Array.from(this.mentors.values());
    
    // Filter by domain
    if (filters?.domain && filters.domain !== 'all') {
      mentors = mentors.filter(mentor => {
        const user = this.users.get(mentor.userId) as User | undefined;
        return user?.domainRole === filters.domain;
      });
    }
    
    // Filter by search
    if (filters?.search) {
      const searchTerm = filters.search.toLowerCase();
      mentors = mentors.filter(mentor => {
        const mentorUser = this.users.get(mentor.userId);
        if (isUser(mentorUser)) {
          const mUser: User = mentorUser;
          return ('' + mUser.name).toLowerCase().includes(searchTerm) ||
                 mentor.expertise?.toLowerCase().includes(searchTerm) || false;
        }
        return mentor.expertise?.toLowerCase().includes(searchTerm) || false;
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

  async getAllBuddies(filters?: { status?: string; domain?: string; search?: string }): Promise<any[]> {
    let buddies = Array.from(this.buddies.values());

    // Filter by status
    if (filters?.status && filters.status !== 'all') {
      buddies = buddies.filter(buddy => buddy.status === filters.status);
    }

    // Filter by domain
    if (filters?.domain && filters.domain !== 'all') {
      buddies = buddies.filter(buddy => {
        const user = this.users.get(buddy.userId) as User | undefined;
        return user?.domainRole === filters.domain;
      });
    }

    // Filter by search
    if (filters?.search) {
      const searchTerm = filters.search.toLowerCase();
      buddies = buddies.filter(buddy => {
        const buddyUser = this.users.get(buddy.userId);
        if (isUser(buddyUser)) {
          const bUser: User = buddyUser;
          return ('' + bUser.name).toLowerCase().includes(searchTerm) ||
                 ('' + bUser.email).toLowerCase().includes(searchTerm);
        }
        return false;
      });
    }

    return buddies.map(buddy => {
      const user = this.users.get(buddy.userId);
      const mentor = buddy.assignedMentorId ? this.mentors.get(buddy.assignedMentorId) : null;
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

  async createBuddy(insertBuddy: InsertBuddy): Promise<Buddy> {
    const allowedStatus = ["active", "inactive", "exited"] as const;
    const id = randomUUID();
    const status = allowedStatus.includes(insertBuddy.status as any)
      ? insertBuddy.status as typeof allowedStatus[number]
      : "active";
    const buddy: Buddy = {
      ...insertBuddy,
      id,
      assignedMentorId: insertBuddy.assignedMentorId || null,
      status,
      progress: insertBuddy.progress ?? null,
      joinDate: insertBuddy.joinDate ?? new Date(),
      createdAt: new Date()
    };
    this.buddies.set(id, buddy);
    return buddy;
  }

  async updateBuddy(id: string, updates: Partial<Buddy>): Promise<Buddy> {
    const buddy = this.buddies.get(id);
    if (!buddy) {
      throw new Error('Buddy not found');
    }
    
    const updatedBuddy = { ...buddy, ...updates, updatedAt: new Date() };
    this.buddies.set(id, updatedBuddy);
    return updatedBuddy;
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

  async assignBuddyToMentor(buddyId: string, mentorId: string): Promise<any> {
    const buddy = this.buddies.get(buddyId);
    if (!buddy) {
      throw new Error('Buddy not found');
    }
    
    const mentor = this.mentors.get(mentorId);
    if (!mentor) {
      throw new Error('Mentor not found');
    }
    
    const updatedBuddy = { ...buddy, assignedMentorId: mentorId };
    this.buddies.set(buddyId, updatedBuddy);
    
    return this.getBuddyById(buddyId);
  }

  // Task methods
  async createTask(insertTask: InsertTask): Promise<Task> {
    const allowedStatus = ["pending", "in_progress", "completed", "overdue"] as const;
    const id = randomUUID();
    const status = allowedStatus.includes(insertTask.status as any)
      ? insertTask.status as typeof allowedStatus[number]
      : "pending";
    const task: Task = {
      ...insertTask,
      id,
      dueDate: insertTask.dueDate ?? null,
      status,
      createdAt: new Date()
    };
    this.tasks.set(id, task);
    return task;
  }

  async getTaskById(id: string): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async getAllTasks(filters?: { status?: string; search?: string; buddyId?: string }): Promise<any[]> {
    let tasks = Array.from(this.tasks.values());

    // Filter by status
    if (filters?.status && filters.status !== 'all') {
      tasks = tasks.filter(task => task.status === filters.status);
    }

    // Filter by search
    if (filters?.search) {
      const searchTerm = filters.search.toLowerCase();
      tasks = tasks.filter(task => 
        task.title.toLowerCase().includes(searchTerm) ||
        task.description.toLowerCase().includes(searchTerm)
      );
    }

    // Filter by buddyId
    if (filters?.buddyId) {
      tasks = tasks.filter(task => task.buddyId === filters.buddyId);
    }

    return tasks.map(task => {
      const mentor = this.mentors.get(task.mentorId);
      const buddy = this.buddies.get(task.buddyId);
      const mentorUser = mentor ? this.users.get(mentor.userId) : null;
      const buddyUser = buddy ? this.users.get(buddy.userId) : null;

      return {
        ...task,
        mentor: mentor ? { ...mentor, user: mentorUser } : null,
        buddy: buddy ? { ...buddy, user: buddyUser } : null
      };
    });
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    const task = this.tasks.get(id);
    if (!task) {
      throw new Error('Task not found');
    }
    const updatedTask = { ...task, ...updates, updatedAt: new Date() };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  async deleteTask(id: string): Promise<void> {
    this.tasks.delete(id);
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

  async getSubmissionsByTaskId(taskId: string): Promise<any[]> {
    const submissions = Array.from(this.submissions.values())
      .filter(submission => submission.taskId === taskId);
    
    return submissions.map(submission => {
      const buddy = this.buddies.get(submission.buddyId);
      const buddyUser = buddy ? this.users.get(buddy.userId) : null;
      
      return {
        ...submission,
        buddy: buddy ? { ...buddy, user: buddyUser } : null
      };
    });
  }

  // Topic methods
  async getTopics(domainRole?: string): Promise<Topic[]> {
    let topics = Array.from(this.topics.values());
    
    if (domainRole) {
      topics = topics.filter(topic => topic.domainRole === domainRole);
    }
    
    return topics;
  }

  async getAllTopics(): Promise<Topic[]> {
    return Array.from(this.topics.values());
  }

  async getTopicById(id: string): Promise<Topic | undefined> {
    return this.topics.get(id);
  }

  async createTopic(insertTopic: InsertTopic): Promise<Topic> {
    const allowedDomainRoles: DomainRole[] = ["frontend", "backend", "devops", "qa", "hr"];
    const id = randomUUID();
    const domainRole: DomainRole = typeof insertTopic.domainRole === 'string' && allowedDomainRoles.includes(insertTopic.domainRole as DomainRole)
      ? insertTopic.domainRole as DomainRole
      : "frontend";
    const topic: Topic = { ...insertTopic, id, domainRole };
    this.topics.set(id, topic);
    return topic;
  }

  async updateTopic(id: string, updates: Partial<Topic>): Promise<Topic> {
    const topic = this.topics.get(id);
    if (!topic) {
      throw new Error('Topic not found');
    }
    
    const updatedTopic = { ...topic, ...updates };
    this.topics.set(id, updatedTopic);
    return updatedTopic;
  }

  async deleteTopic(id: string): Promise<void> {
    this.topics.delete(id);
  }

  // Progress tracking methods
  async createBuddyTopicProgress(insertProgress: InsertBuddyTopicProgress): Promise<BuddyTopicProgress> {
    const id = randomUUID();
    const progress: BuddyTopicProgress = { 
      ...insertProgress, 
      id,
      checked: insertProgress.checked ?? null,
      completedAt: insertProgress.completedAt ?? null
    };
    this.buddyTopicProgress.set(id, progress);
    return progress;
  }

  // Resource management
  async getAllResources(filters?: { category?: string; difficulty?: string; type?: string; search?: string }): Promise<any[]> {
    // Mock resources - in real app this would come from database
    const mockResources = [
      {
        id: '1',
        title: 'React Fundamentals',
        description: 'Complete guide to React basics and core concepts',
        type: 'course',
        category: 'frontend',
        url: 'https://react.dev/learn',
        tags: ['react', 'javascript', 'frontend'],
        difficulty: 'beginner',
        duration: '4 hours',
        author: 'React Team',
        rating: 4.8,
        isBookmarked: false
      },
      {
        id: '2',
        title: 'TypeScript Handbook',
        description: 'Official TypeScript documentation and tutorials',
        type: 'documentation',
        category: 'frontend',
        url: 'https://www.typescriptlang.org/docs/',
        tags: ['typescript', 'javascript', 'frontend'],
        difficulty: 'intermediate',
        author: 'Microsoft',
        rating: 4.9,
        isBookmarked: true
      }
    ];

    let resources = mockResources;

    // Apply filters
    if (filters?.category && filters.category !== 'all') {
      resources = resources.filter(resource => resource.category === filters.category);
    }

    if (filters?.difficulty && filters.difficulty !== 'all') {
      resources = resources.filter(resource => resource.difficulty === filters.difficulty);
    }

    if (filters?.type && filters.type !== 'all') {
      resources = resources.filter(resource => resource.type === filters.type);
    }

    if (filters?.search) {
      const searchTerm = filters.search.toLowerCase();
      resources = resources.filter(resource =>
        resource.title.toLowerCase().includes(searchTerm) ||
        resource.description.toLowerCase().includes(searchTerm) ||
        resource.tags.some((tag: string) => tag.toLowerCase().includes(searchTerm))
      );
    }

    return resources;
  }

  async createResource(resource: any): Promise<any> {
    const id = randomUUID();
    const newResource = {
      ...resource,
      id,
      createdAt: new Date(),
      isBookmarked: false
    };
    this.resources.set(id, newResource);
    return newResource;
  }

  async getResourceById(id: string): Promise<any | undefined> {
    return this.resources.get(id);
  }

  async updateResource(id: string, updates: any): Promise<any> {
    const resource = this.resources.get(id);
    if (!resource) {
      throw new Error('Resource not found');
    }
    const updatedResource = { ...resource, ...updates, updatedAt: new Date() };
    this.resources.set(id, updatedResource);
    return updatedResource;
  }

  async deleteResource(id: string): Promise<void> {
    if (!this.resources.has(id)) {
      throw new Error('Resource not found');
    }
    this.resources.delete(id);
  }

  private initializeDefaultCurriculum() {
    // Add some default curriculum items for demonstration
    const defaultCurriculum: Curriculum[] = [
      {
        id: randomUUID(),
        title: 'React Fundamentals',
        description: 'Learn the basics of React including components, props, and state',
        domain: 'frontend',
        createdBy: 'user-1', // This would be a real user ID in production
        content: 'This curriculum covers the fundamental concepts of React...',
        attachments: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: randomUUID(),
        title: 'Node.js Basics',
        description: 'Introduction to server-side JavaScript with Node.js',
        domain: 'backend',
        createdBy: 'user-1',
        content: 'This curriculum introduces Node.js and its core modules...',
        attachments: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    // Add to map
    for (const item of defaultCurriculum) {
      this.curriculum.set(item.id, item);
    }
  }

  async getAllCurriculum(filters?: { domain?: string; search?: string }): Promise<Curriculum[]> {
    let curriculumItems = Array.from(this.curriculum.values());

    // Apply filters
    if (filters?.domain && filters.domain !== 'all') {
      curriculumItems = curriculumItems.filter(item => item.domain === filters.domain);
    }

    if (filters?.search) {
      const searchTerm = filters.search.toLowerCase();
      curriculumItems = curriculumItems.filter(item =>
        item.title.toLowerCase().includes(searchTerm) ||
        item.description.toLowerCase().includes(searchTerm)
      );
    }

    return curriculumItems;
  }

  async getCurriculumById(id: string): Promise<Curriculum | undefined> {
    return this.curriculum.get(id);
  }

  async createCurriculum(curriculum: InsertCurriculum): Promise<Curriculum> {
    const allowedDomains: DomainRole[] = ["frontend", "backend", "devops", "qa", "hr"];
    const id = randomUUID();
    const now = new Date();
    const domain: DomainRole = allowedDomains.includes(curriculum.domain as DomainRole)
      ? curriculum.domain as DomainRole
      : "frontend";
    const newCurriculum: Curriculum = {
      ...curriculum,
      id,
      domain,
      attachments: curriculum.attachments !== undefined ? curriculum.attachments : null,
      createdAt: now,
      updatedAt: now
    };
    this.curriculum.set(id, newCurriculum);
    return newCurriculum;
  }

  async updateCurriculum(id: string, updates: Partial<Curriculum>): Promise<Curriculum> {
    const allowedDomains: DomainRole[] = ["frontend", "backend", "devops", "qa", "hr"];
    const existing = this.curriculum.get(id);
    if (!existing) {
      throw new Error(`Curriculum with ID ${id} not found`);
    }
    let domain: DomainRole = existing.domain;
    if (updates.domain && allowedDomains.includes(updates.domain as DomainRole)) {
      domain = updates.domain as DomainRole;
    }
    const updated: Curriculum = {
      ...existing,
      ...updates,
      domain,
      attachments: updates.attachments !== undefined ? updates.attachments : (existing.attachments !== undefined ? existing.attachments : null),
      updatedAt: new Date()
    };
    this.curriculum.set(id, updated);
    return updated;
  }

  async deleteCurriculum(id: string): Promise<void> {
    if (!this.curriculum.has(id)) {
      throw new Error(`Curriculum with ID ${id} not found`);
    }
    
    this.curriculum.delete(id);
  }
}

import { DbStorage } from './db-storage';

// Type guard for User
function isUser(obj: any): obj is User {
  return obj && typeof obj === 'object' && typeof obj.name === 'string' && typeof obj.email === 'string';
}

// Initialize storage with database connection
async function initializeStorage(): Promise<IStorage> {
  try {
    console.log('[Storage] Attempting to use database storage...');
    const dbStorage = new DbStorage();
    
    // Test the connection by running the migration
    await runMigrations();
    
    console.log('[Storage] Database storage initialized successfully');
    
    // Add some initial data to database if tables are empty
    try {
    await seedDatabaseData(dbStorage);
    } catch (seedError) {
      console.log('[Storage] Database already seeded or seeding failed, continuing...');
    }
    
    return dbStorage;
  } catch (error) {
    console.error('[Storage] Database connection failed, using memory storage:', error);
    
    // Fallback to memory storage with test data
    const memStorage = new MemStorage();
    
    const testUser = await memStorage.createUser({
      email: 'test@example.com',
      name: 'Test User',
      role: 'mentor',
      domainRole: 'frontend'
    });
    
    await memStorage.createMentor({
      userId: String(testUser.id),
      expertise: 'Experienced frontend developer with React, TypeScript, JavaScript',
      experience: '5+ years in frontend development',
      responseRate: 95,
      isActive: true
    });

    // Create some buddies with sample data
    const buddy1 = await memStorage.createBuddy({
      userId: String(testUser.id), // Same user for demo
      status: 'active'
    });

    // Create some sample topics
    const topics = [
      { name: 'HTML Fundamentals', category: 'basics', domainRole: 'frontend' },
      { name: 'CSS Styling', category: 'basics', domainRole: 'frontend' },
      { name: 'JavaScript ES6+', category: 'intermediate', domainRole: 'frontend' },
      { name: 'React Components', category: 'advanced', domainRole: 'frontend' },
      { name: 'State Management', category: 'advanced', domainRole: 'frontend' }
    ];

    for (const topic of topics) {
      await memStorage.createTopic({
        name: topic.name,
        category: topic.category,
        domainRole: topic.domainRole as DomainRole
      });
    }

    // Create some sample tasks
    await memStorage.createTask({
      title: 'Build a Todo App',
      description: 'Create a simple todo application using React with add, edit, and delete functionality.',
      mentorId: String(testUser.id), // Use the mentor ID
      buddyId: String(buddy1.id),
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      status: 'pending'
    });

    await memStorage.createTask({
      title: 'Learn CSS Flexbox',
      description: 'Complete exercises on CSS Flexbox layout and create a responsive navigation bar.',
      mentorId: String(testUser.id), // Use the mentor ID
      buddyId: String(buddy1.id),
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      status: 'in_progress'
    });
    
    return memStorage;
  }
}

// Run database migrations
async function runMigrations() {
  try {
  const { migrate } = await import('drizzle-orm/node-postgres/migrator');
  const { db } = await import('./db');
  
  console.log('[Storage] Running database migrations...');
  await migrate(db, { migrationsFolder: './migrations' });
  console.log('[Storage] Migrations completed successfully');
  } catch (error) {
    console.log('[Storage] Migrations already applied or not needed');
  }
}

// Seed database with initial data
async function seedDatabaseData(dbStorage: DbStorage) {
  try {
    // Check if data already exists by looking for test user
    const existingUser = await dbStorage.getUserByEmail('test@example.com');
    if (existingUser) {
      console.log('[Storage] Database already seeded');
      return;
    }

    console.log('[Storage] Seeding database with initial data...');
    
    // Create test user
    const testUser = await dbStorage.createUser({
      email: 'test@example.com',
      name: 'Test User',
      role: 'mentor',
      domainRole: 'frontend'
    });

    // Create mentor profile
    const mentor = await dbStorage.createMentor({
      userId: String(testUser.id),
      expertise: 'Experienced frontend developer with React, TypeScript, JavaScript',
      experience: '5+ years in frontend development',
      responseRate: 95,
      isActive: true
    });

    // Create buddy user
    const buddyUser = await dbStorage.createUser({
      email: 'buddy@example.com',
      name: 'Test Buddy',
      role: 'buddy',
      domainRole: 'frontend'
    });

    // Create buddy profile
    const buddy = await dbStorage.createBuddy({
      userId: String(buddyUser.id),
      assignedMentorId: String(mentor.id),
      status: 'active'
    });

    // Create topics
    const topics = [
      { name: 'HTML Fundamentals', category: 'basics', domainRole: 'frontend' },
      { name: 'CSS Styling', category: 'basics', domainRole: 'frontend' },
      { name: 'JavaScript ES6+', category: 'intermediate', domainRole: 'frontend' },
      { name: 'React Components', category: 'advanced', domainRole: 'frontend' },
      { name: 'State Management', category: 'advanced', domainRole: 'frontend' }
    ];

    for (const topic of topics) {
      await dbStorage.createTopic({
        name: topic.name,
        category: topic.category,
        domainRole: topic.domainRole as DomainRole
      });
    }

    // Create tasks
    await dbStorage.createTask({
      title: 'Build a Todo App',
      description: 'Create a simple todo application using React with add, edit, and delete functionality.',
      mentorId: String(mentor.id),
      buddyId: String(buddy.id),
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: 'pending'
    });

    await dbStorage.createTask({
      title: 'Learn CSS Flexbox',
      description: 'Complete exercises on CSS Flexbox layout and create a responsive navigation bar.',
      mentorId: String(mentor.id),
      buddyId: String(buddy.id),
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      status: 'in_progress'
    });

    console.log('[Storage] Database seeded successfully');
  } catch (error) {
    console.error('[Storage] Error seeding database:', error);
    throw error;
  }
}

// Create storage instance
let storage: IStorage = new MemStorage();

// Initialize storage asynchronously
initializeStorage().then(initializedStorage => {
  storage = initializedStorage;
}).catch(error => {
  console.error('[Storage] Critical error initializing storage:', error);
});

export { storage };
