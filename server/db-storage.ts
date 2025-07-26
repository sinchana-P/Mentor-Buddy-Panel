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
  buddyTopicProgress
} from "@shared/schema";
import { eq, and, like, desc } from 'drizzle-orm';
import { db } from './db';
import type { IStorage } from './storage';

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

  async createUser(insertUser: InsertUser): Promise<User> {
    console.log(`[DbStorage] Creating user:`, insertUser);
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
    const results = await db.select().from(mentors);
    
    return results.map(mentor => ({
      ...mentor,
      user: null, // Would need to join with users table
      stats: {
        buddiesCount: 0,
        completedTasks: 0
      }
    }));
  }

  async getMentorById(id: string): Promise<any> {
    const result = await db.select().from(mentors).where(eq(mentors.id, id)).limit(1);
    const mentor = result[0];
    
    if (!mentor) return null;
    
    return {
      ...mentor,
      user: null, // Would need to join with users table
      stats: {
        totalBuddies: 0,
        activeBuddies: 0,
        completedTasks: 0,
        responseRate: mentor.responseRate
      }
    };
  }

  async createMentor(mentor: InsertMentor): Promise<Mentor> {
    const result = await db.insert(mentors).values(mentor).returning();
    return result[0];
  }

  async getMentorBuddies(mentorId: string, status?: string): Promise<any[]> {
    let query = db.select().from(buddies).where(eq(buddies.assignedMentorId, mentorId));
    
    if (status && status !== 'all') {
      query = query.where(eq(buddies.status, status as any));
    }
    
    const results = await query;
    
    return results.map(buddy => ({
      ...buddy,
      user: null, // Would need to join with users table
      mentor: null,
      stats: {
        completedTasks: 0,
        totalTasks: 0
      }
    }));
  }

  // Buddy management
  async getBuddyById(id: string): Promise<any> {
    const result = await db.select().from(buddies).where(eq(buddies.id, id)).limit(1);
    const buddy = result[0];
    
    if (!buddy) return null;
    
    return {
      ...buddy,
      user: null, // Would need to join with users table
      mentor: null
    };
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

  // Task management
  async createTask(task: InsertTask): Promise<Task> {
    const result = await db.insert(tasks).values(task).returning();
    return result[0];
  }

  async getTaskById(id: string): Promise<Task | undefined> {
    const result = await db.select().from(tasks).where(eq(tasks.id, id)).limit(1);
    return result[0];
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
}