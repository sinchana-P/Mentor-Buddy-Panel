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
  users,
  mentors,
  buddies,
  tasks,
  submissions,
  topics,
  buddyTopicProgress,
  resources
} from "@shared/schema";
import { eq, and, like, desc } from 'drizzle-orm';
import { db } from './db';
import type { IStorage } from './storage';
import { randomUUID } from 'crypto';

export class DbStorage implements IStorage {
  constructor() {
    // Remove async test from constructor - will be handled during initialization
    console.log('[DbStorage] Database storage instance created');
  }

  // User management
  async getUser(id: string): Promise<User | undefined> {
    console.log(`[DbStorage] Looking for user ID: ${id}`);
    try {
      const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
      const user = result[0];
      console.log(`[DbStorage] User found:`, user ? 'YES' : 'NO');
      return user;
    } catch (error) {
      console.error(`[DbStorage] Error fetching user ${id}:`, error);
      throw error;
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async getAllUsers(): Promise<User[]> {
    const result = await db.select().from(users);
    return result;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    console.log(`[DbStorage] Creating user:`, insertUser);
    // Duplicate email check
    const existing = await this.getUserByEmail(insertUser.email);
    if (existing) {
      const err: any = new Error('Email already exists');
      err.code = 'DUPLICATE_EMAIL';
      throw err;
    }
    const result = await db.insert(users).values(insertUser).returning();
    const user = result[0];
    console.log(`[DbStorage] User created successfully:`, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const result = await db.update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    
    if (result.length === 0) {
      throw new Error("User not found");
    }
    
    return result[0];
  }

  // Dashboard
  async getDashboardStats(): Promise<any> {
    const [mentorResults, buddyResults, taskResults] = await Promise.all([
      db.select().from(mentors),
      db.select().from(buddies),
      db.select().from(tasks)
    ]);

    const totalMentors = mentorResults.length;
    const activeBuddies = buddyResults.filter(b => b.status === 'active').length;
    const weeklyTasks = taskResults.filter(t => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(t.createdAt) > weekAgo;
    }).length;
    
    const completedTasks = taskResults.filter(t => t.status === 'completed').length;
    const completionRate = taskResults.length > 0 ? Math.round((completedTasks / taskResults.length) * 100) : 0;

    return {
      totalMentors,
      activeBuddies,
      weeklyTasks,
      completionRate,
      mentors: {
        total: totalMentors,
        active: mentorResults.filter(m => m.isActive).length
      },
      buddies: {
        total: buddyResults.length,
        active: activeBuddies,
        inactive: buddyResults.filter(b => b.status === 'inactive').length,
        exited: buddyResults.filter(b => b.status === 'exited').length
      }
    };
  }

  async getRecentActivity(): Promise<any[]> {
    // Get recent tasks with mentor and buddy info
    const recentTasks = await db.select({
      id: tasks.id,
      title: tasks.title,
      status: tasks.status,
      createdAt: tasks.createdAt,
      mentorId: tasks.mentorId,
      buddyId: tasks.buddyId
    })
    .from(tasks)
    .orderBy(desc(tasks.createdAt))
    .limit(10);

    // This is a simplified version - in a real app you'd join with users table
    return recentTasks.map(task => ({
      id: task.id,
      mentorName: "Mentor", // Would be fetched via join
      buddyName: "Buddy",   // Would be fetched via join
      action: "assigned task",
      type: task.status,
      timestamp: task.createdAt.toISOString()
    }));
  }

  // Mentor management
  async getMentors(filters: { role?: string; status?: string; search?: string }): Promise<any[]> {
    let query = db
      .select({
        mentor: mentors,
        user: users
      })
      .from(mentors)
      .leftJoin(users, eq(mentors.userId, users.id));
    
    // Apply filters
    if (filters?.status && filters.status !== 'all') {
      query = query.where(eq(mentors.isActive, filters.status === 'active'));
    }
    
    if (filters?.search) {
      query = query.where(like(users.name, `%${filters.search}%`));
    }
    
    const results = await query;
    
    return results.map(result => {
      // Get buddy count for this mentor
      const buddyCount = 0; // Will be calculated in a separate query
      
      return {
        ...result.mentor,
        user: result.user,
      stats: {
          buddiesCount: buddyCount,
        completedTasks: 0
      }
      };
    });
  }

  async getMentorById(id: string): Promise<any> {
    const result = await db
      .select({
        mentor: mentors,
        user: users
      })
      .from(mentors)
      .leftJoin(users, eq(mentors.userId, users.id))
      .where(eq(mentors.id, id))
      .limit(1);
    
    const mentorData = result[0];
    
    if (!mentorData) return null;
    
    // Get buddy counts
    const buddyResults = await db
      .select()
      .from(buddies)
      .where(eq(buddies.assignedMentorId, id));
    
    const totalBuddies = buddyResults.length;
    const activeBuddies = buddyResults.filter(b => b.status === 'active').length;
    
    return {
      ...mentorData.mentor,
      user: mentorData.user,
      stats: {
        totalBuddies,
        activeBuddies,
        completedTasks: 0,
        responseRate: mentorData.mentor.responseRate
      }
    };
  }

  async createMentor(mentor: InsertMentor): Promise<Mentor> {
    const result = await db.insert(mentors).values(mentor).returning();
    return result[0];
  }

  async updateMentor(id: string, updates: Partial<Mentor>): Promise<Mentor> {
    const result = await db.update(mentors)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(mentors.id, id))
      .returning();
    
    if (result.length === 0) {
      throw new Error('Mentor not found');
    }
    
    return result[0];
  }

  async getMentorBuddies(mentorId: string, status?: string): Promise<any[]> {
    let query = db
      .select({
        buddy: buddies,
        user: users
      })
      .from(buddies)
      .leftJoin(users, eq(buddies.userId, users.id))
      .where(eq(buddies.assignedMentorId, mentorId));
    
    if (status && status !== 'all') {
      query = query.where(eq(buddies.status, status as any));
    }
    
    const results = await query;
    
    return results.map(result => ({
      ...result.buddy,
      user: result.user,
      mentor: null, // TODO: Join with mentor data if needed
      stats: {
        completedTasks: 0,
        totalTasks: 0
      }
    }));
  }

  // Buddy management
  async getBuddyById(id: string): Promise<any> {
    // First get buddy with user data
    const buddyResult = await db
      .select({
        buddy: buddies,
        user: users
      })
      .from(buddies)
      .leftJoin(users, eq(buddies.userId, users.id))
      .where(eq(buddies.id, id))
      .limit(1);
    
    const buddyData = buddyResult[0];
    
    if (!buddyData) return null;
    
    // Then get mentor data if assigned
    let mentorData = null;
    if (buddyData.buddy.assignedMentorId) {
      const mentorResult = await db
        .select({
          mentor: mentors,
          mentorUser: users
        })
        .from(mentors)
        .leftJoin(users, eq(mentors.userId, users.id))
        .where(eq(mentors.id, buddyData.buddy.assignedMentorId))
        .limit(1);
      
      if (mentorResult[0]) {
        mentorData = {
          ...mentorResult[0].mentor,
          user: mentorResult[0].mentorUser
        };
      }
    }
    
    return {
      ...buddyData.buddy,
      user: buddyData.user,
      mentor: mentorData
    };
  }

  async getAllBuddies(filters?: { status?: string; domain?: string; search?: string }): Promise<any[]> {
    let query = db
      .select({
        buddy: buddies,
        user: users
      })
      .from(buddies)
      .leftJoin(users, eq(buddies.userId, users.id));
    
    // Filter by status
    if (filters?.status && filters.status !== 'all') {
      query = query.where(eq(buddies.status, filters.status as any));
    }
    
    // Filter by domain
    if (filters?.domain && filters.domain !== 'all') {
      query = query.where(eq(users.domainRole, filters.domain as any));
    }
    
    // Filter by search
    if (filters?.search) {
      query = query.where(like(users.name, `%${filters.search}%`));
    }
    
    const results = await query;
    
    return results.map(result => ({
      ...result.buddy,
      user: result.user,
      mentor: null, // TODO: Join with mentor data if needed
      stats: {
        completedTasks: 0,
        totalTasks: 0
      }
    }));
  }

  async createBuddy(buddy: InsertBuddy): Promise<Buddy> {
    const result = await db.insert(buddies).values(buddy).returning();
    return result[0];
  }

  async getBuddyTasks(buddyId: string): Promise<any[]> {
    const results = await db.select().from(tasks).where(eq(tasks.buddyId, buddyId));
    
    return results.map(task => ({
      ...task,
      submissions: [] // Would need to fetch submissions separately
    }));
  }

  async getBuddyProgress(buddyId: string): Promise<any> {
    const progressResults = await db.select()
      .from(buddyTopicProgress)
      .where(eq(buddyTopicProgress.buddyId, buddyId));
    
    const totalTopics = await db.select().from(topics);
    const checkedCount = progressResults.filter(p => p.checked).length;
    const percentage = totalTopics.length > 0 ? Math.round((checkedCount / totalTopics.length) * 100) : 0;
    
    return {
      topics: progressResults.map(p => ({
        id: p.topicId,
        name: "Topic", // Would need to join with topics table
        checked: p.checked
      })),
      percentage
    };
  }

  async updateBuddyTopicProgress(buddyId: string, topicId: string, checked: boolean): Promise<any> {
    // First, try to update existing progress
    const existing = await db.select()
      .from(buddyTopicProgress)
      .where(and(
        eq(buddyTopicProgress.buddyId, buddyId),
        eq(buddyTopicProgress.topicId, topicId)
      ));
    
    if (existing.length > 0) {
      const result = await db.update(buddyTopicProgress)
        .set({ checked, completedAt: checked ? new Date() : null })
        .where(and(
          eq(buddyTopicProgress.buddyId, buddyId),
          eq(buddyTopicProgress.topicId, topicId)
        ))
        .returning();
      return result[0];
    } else {
      const result = await db.insert(buddyTopicProgress)
        .values({
          buddyId,
          topicId,
          checked,
          completedAt: checked ? new Date() : null
        })
        .returning();
      return result[0];
    }
  }

  async getBuddyPortfolio(buddyId: string): Promise<any[]> {
    // Get completed tasks for this buddy
    const completedTasks = await db.select()
      .from(tasks)
      .where(and(
        eq(tasks.buddyId, buddyId),
        eq(tasks.status, 'completed')
      ));
    
    return completedTasks.map(task => ({
      id: task.id,
      title: task.title,
      description: task.description,
      completedAt: task.createdAt.toISOString(),
      technologies: [],
      githubLink: null,
      deployedUrl: null
    }));
  }

  async assignBuddyToMentor(buddyId: string, mentorId: string): Promise<any> {
    // Update buddy's assigned mentor
    const result = await db.update(buddies)
      .set({ assignedMentorId: mentorId })
      .where(eq(buddies.id, buddyId))
      .returning();
    
    if (result.length === 0) {
      throw new Error('Buddy not found');
    }
    
    return this.getBuddyById(buddyId);
  }

  // Task management
  async createTask(task: InsertTask): Promise<Task> {
    const result = await db.insert(tasks).values(task).returning();
    return result[0];
  }

  async getTaskById(id: string): Promise<Task | undefined> {
    const result = await db.select().from(tasks).where(eq(tasks.id, id)).limit(1);
    return result[0];
  }

  async getAllTasks(filters?: { status?: string; search?: string; buddyId?: string }): Promise<any[]> {
    let conditions = [];
    
    // Filter by status
    if (filters?.status && filters.status !== 'all') {
      conditions.push(eq(tasks.status, filters.status as any));
    }

    // Filter by buddyId
    if (filters?.buddyId) {
      conditions.push(eq(tasks.buddyId, filters.buddyId));
    }
    
    let query = db.select().from(tasks);
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    const results = await query;
    
    return results.map(task => ({
      ...task,
      mentor: null, // Would need to join with mentors table
      buddy: null   // Would need to join with buddies table
    }));
  }

  // Submission management
  async createSubmission(submission: InsertSubmission): Promise<Submission> {
    const result = await db.insert(submissions).values(submission).returning();
    return result[0];
  }

  // Topic management
  async getTopics(domainRole?: string): Promise<Topic[]> {
    if (domainRole) {
      return await db.select().from(topics).where(eq(topics.domainRole, domainRole as any));
    }
    
    return await db.select().from(topics);
  }

  async createTopic(topic: InsertTopic): Promise<Topic> {
    const result = await db.insert(topics).values(topic).returning();
    return result[0];
  }

  // Progress tracking
  async createBuddyTopicProgress(progress: InsertBuddyTopicProgress): Promise<BuddyTopicProgress> {
    const result = await db.insert(buddyTopicProgress).values(progress).returning();
    return result[0];
  }

  // Resource management
  async getAllResources(filters?: { category?: string; difficulty?: string; type?: string; search?: string }): Promise<any[]> {
    let query = db.select().from(resources);
    // Apply filters
    if (filters?.category && filters.category !== 'all') {
      query = query.where(eq(resources.category, filters.category));
    }
    if (filters?.difficulty && filters.difficulty !== 'all') {
      query = query.where(eq(resources.difficulty, filters.difficulty));
    }
    if (filters?.type && filters.type !== 'all') {
      query = query.where(eq(resources.type, filters.type));
    }
    // TODO: Add search filter if needed
    const result = await query;
    return result;
  }

  async createResource(resource: any): Promise<any> {
    const now = new Date();
    const insertData = {
      ...resource,
      tags: Array.isArray(resource.tags) ? resource.tags : (typeof resource.tags === 'string' ? resource.tags.split(',').map((t: string) => t.trim()) : []),
      createdAt: now,
      updatedAt: now,
    };
    const result = await db.insert(resources).values(insertData).returning();
    return result[0];
  }
}