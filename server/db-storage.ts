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
  users,
  mentors,
  buddies,
  tasks,
  submissions,
  topics,
  buddyTopicProgress,
  resources,
  curriculum,
  insertUserSchema,
  insertBuddySchema,
  insertTaskSchema,
  insertTopicSchema
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
      return user as User;
    } catch (error) {
      console.error(`[DbStorage] Error fetching user ${id}:`, error);
      throw error;
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0] as User;
  }

  async getAllUsers(): Promise<User[]> {
    const result = await db.select().from(users);
    return result as User[];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    console.log(`[DbStorage] Creating user:`, insertUser);
    // Duplicate email check
    const existing = await this.getUserByEmail(insertUser.email as string);
    if (existing) {
      const err: any = new Error('Email already exists');
      err.code = 'DUPLICATE_EMAIL';
      throw err;
    }
    // Strictly construct the object for .values()
    const allowedRoles = ["manager", "mentor", "buddy"];
    const allowedDomainRoles = ["frontend", "backend", "devops", "qa", "hr"];
    const role = typeof insertUser.role === "string" && allowedRoles.includes(insertUser.role) ? insertUser.role : "buddy";
    const domainRole = typeof insertUser.domainRole === "string" && allowedDomainRoles.includes(insertUser.domainRole) ? insertUser.domainRole : "frontend";
    const userToInsert = {
      name: insertUser.name,
      email: insertUser.email,
      role,
      domainRole,
      avatarUrl: insertUser.avatarUrl
    };
    try {
      const result = await db.insert(users).values(userToInsert).returning();
      const user = result[0];
      console.log(`[DbStorage] User created successfully:`, user);
      return user as User;
    } catch (error) {
      console.error(`[DbStorage] Error creating user:`, error);
      throw error;
    }
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const result = await db.update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    
    if (result.length === 0) {
      throw new Error("User not found");
    }
    
    return result[0] as User;
  }

  async deleteUser(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
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
    let conditions = [];
    if (filters?.status && filters.status !== 'all') {
      conditions.push(eq(mentors.isActive, filters.status === 'active'));
    }
    if (filters?.search) {
      conditions.push(like(users.name, `%${filters.search}%`));
    }
    let baseQuery = db
      .select({
        mentor: mentors,
        user: users
      })
      .from(mentors)
      .leftJoin(users, eq(mentors.userId, users.id));
    const query = conditions.length > 0 ? baseQuery.where(and(...conditions)) : baseQuery;
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
    console.log('[DbStorage] Creating mentor with data:', JSON.stringify(mentor));
    
    // Validate required fields
    if (!mentor.userId) {
      console.error('[DbStorage] Missing required userId for mentor creation');
      const error: any = new Error('Missing required userId');
      error.code = 'INVALID_MENTOR_DATA';
      throw error;
    }
    
    // Verify user exists
    const user = await this.getUser(mentor.userId);
    if (!user) {
      console.error(`[DbStorage] User with ID ${mentor.userId} not found`);
      const error: any = new Error(`User with ID ${mentor.userId} not found`);
      error.code = 'USER_NOT_FOUND';
      throw error;
    }
    
    try {
      // Ensure all required fields have values
      const mentorToInsert = {
        userId: mentor.userId,
        expertise: mentor.expertise || '',
        experience: mentor.experience || '',
        responseRate: mentor.responseRate ?? 0,
        isActive: mentor.isActive ?? true
      };
      
      const result = await db.insert(mentors).values(mentorToInsert).returning();
      console.log('[DbStorage] Mentor created successfully:', result[0]);
      return result[0];
    } catch (error) {
      console.error('[DbStorage] Error creating mentor:', error);
      throw error;
    }
  }

  async updateMentor(id: string, updates: Partial<Mentor>): Promise<Mentor> {
    // Only set fields that exist in the schema (remove updatedAt if not in schema)
    const allowedUpdates: Partial<Mentor> = {};
    for (const key of Object.keys(updates)) {
      if (key in mentors) {
        (allowedUpdates as any)[key] = (updates as any)[key];
      }
    }
    const result = await db.update(mentors)
      .set(allowedUpdates)
      .where(eq(mentors.id, id))
      .returning();
    if (result.length === 0) {
      throw new Error('Mentor not found');
    }
    return result[0];
  }

  async deleteMentor(id: string): Promise<void> {
    await db.delete(mentors).where(eq(mentors.id, id));
  }

  async getAllMentors(filters?: { domain?: string; search?: string }): Promise<any[]> {
    let conditions = [];
    if (filters?.domain && filters.domain !== 'all') {
      conditions.push(eq(users.domainRole, filters.domain as any));
    }
    if (filters?.search) {
      conditions.push(like(users.name, `%${filters.search}%`));
    }
    let baseQuery = db
      .select({
        mentor: mentors,
        user: users
      })
      .from(mentors)
      .leftJoin(users, eq(mentors.userId, users.id));
    const query = conditions.length > 0 ? baseQuery.where(and(...conditions)) : baseQuery;
    const results = await query;
    
    return results.map(result => ({
      ...result.mentor,
      user: result.user,
      stats: {
        buddiesCount: 0, // Would need to calculate in a separate query
        completedTasks: 0
      }
    }));
  }

  async getMentorBuddies(mentorId: string, status?: string): Promise<any[]> {
    let conditions = [eq(buddies.assignedMentorId, mentorId)];
    if (status && status !== 'all') {
      conditions.push(eq(buddies.status, status as any));
    }
    let baseQuery = db
      .select({
        buddy: buddies,
        user: users
      })
      .from(buddies)
      .leftJoin(users, eq(buddies.userId, users.id));
    const query = conditions.length > 0 ? baseQuery.where(and(...conditions)) : baseQuery;
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
    let conditions = [];
    if (filters?.status && filters.status !== 'all') {
      conditions.push(eq(buddies.status, filters.status as any));
    }
    if (filters?.domain && filters.domain !== 'all') {
      conditions.push(eq(users.domainRole, filters.domain as any));
    }
    if (filters?.search) {
      conditions.push(like(users.name, `%${filters.search}%`));
    }
    let baseQuery = db
      .select({
        buddy: buddies,
        user: users
      })
      .from(buddies)
      .leftJoin(users, eq(buddies.userId, users.id));
    const query = conditions.length > 0 ? baseQuery.where(and(...conditions)) : baseQuery;
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
    // Strictly construct the object for .values()
    const allowedStatuses = ["active", "inactive", "exited"];
    const status = typeof buddy.status === "string" && allowedStatuses.includes(buddy.status) ? buddy.status : "active";
    const buddyToInsert = {
      userId: buddy.userId,
      assignedMentorId: buddy.assignedMentorId,
      status,
      joinDate: buddy.joinDate,
      progress: buddy.progress
    };
    const result = await db.insert(buddies).values(buddyToInsert).returning();
    return result[0];
  }

  async updateBuddy(id: string, updates: Partial<Buddy>): Promise<Buddy> {
    const allowedUpdates: Partial<Buddy> = {};
    for (const key of Object.keys(updates)) {
      if (key in buddies) {
        (allowedUpdates as any)[key] = (updates as any)[key];
      }
    }
    const result = await db.update(buddies)
      .set(allowedUpdates)
      .where(eq(buddies.id, id))
      .returning();
    if (result.length === 0) {
      throw new Error('Buddy not found');
    }
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
    // Strictly construct the object for .values()
    const allowedStatuses = ["pending", "in_progress", "completed", "overdue"];
    const status = typeof task.status === "string" && allowedStatuses.includes(task.status) ? task.status : "pending";
    const taskToInsert = {
      mentorId: task.mentorId,
      buddyId: task.buddyId,
      title: task.title,
      description: task.description,
      status,
      dueDate: task.dueDate
    };
    const result = await db.insert(tasks).values(taskToInsert).returning();
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
    
    // Filter by search
    if (filters?.search) {
      conditions.push(like(tasks.title, `%${filters.search}%`));
    }

    let baseQuery = db.select().from(tasks);
    const query = conditions.length > 0 ? baseQuery.where(and(...conditions)) : baseQuery;
    
    const results = await query;
    
    return results.map(task => ({
      ...task,
      mentor: null, // Would need to join with mentors table
      buddy: null   // Would need to join with buddies table
    }));
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    const allowedUpdates: Partial<Task> = {};
    for (const key of Object.keys(updates)) {
      if (key in tasks) {
        (allowedUpdates as any)[key] = (updates as any)[key];
      }
    }
    const result = await db.update(tasks)
      .set(allowedUpdates)
      .where(eq(tasks.id, id))
      .returning();
    if (result.length === 0) {
      throw new Error('Task not found');
    }
    return result[0];
  }

  async deleteTask(id: string): Promise<void> {
    await db.delete(tasks).where(eq(tasks.id, id));
  }

  // Submission management
  async createSubmission(submission: InsertSubmission): Promise<Submission> {
    const result = await db.insert(submissions).values(submission).returning();
    return result[0];
  }

  async getSubmissionsByTaskId(taskId: string): Promise<any[]> {
    const results = await db
      .select({
        submission: submissions,
        buddy: buddies,
        user: users
      })
      .from(submissions)
      .where(eq(submissions.taskId, taskId))
      .leftJoin(buddies, eq(submissions.buddyId, buddies.id))
      .leftJoin(users, eq(buddies.userId, users.id));
    
    return results.map(result => ({
      ...result.submission,
      buddy: {
        ...result.buddy,
        user: result.user
      }
    }));
  }

  // Topic management
  async getTopics(domainRole?: string): Promise<Topic[]> {
    if (domainRole) {
      return await db.select().from(topics).where(eq(topics.domainRole, domainRole as any)) as Topic[];
    }
    
    return await db.select().from(topics) as Topic[];
  }
  
  async getAllTopics(): Promise<Topic[]> {
    return await db.select().from(topics) as Topic[];
  }

  async getTopicById(id: string): Promise<Topic | undefined> {
    const result = await db.select().from(topics).where(eq(topics.id, id)).limit(1);
    return result[0] as Topic;
  }

  async createTopic(topic: InsertTopic): Promise<Topic> {
    // Strictly construct the object for .values()
    const allowedDomainRoles = ["frontend", "backend", "devops", "qa", "hr"];
    const domainRole = typeof topic.domainRole === "string" && allowedDomainRoles.includes(topic.domainRole) ? topic.domainRole : "frontend";
    const topicToInsert = {
      name: topic.name,
      domainRole,
      category: topic.category
    };
    const result = await db.insert(topics).values(topicToInsert).returning();
    return result[0] as Topic;
  }

  async updateTopic(id: string, updates: Partial<Topic>): Promise<Topic> {
    const allowedUpdates: Partial<Topic> = {};
    for (const key of Object.keys(updates)) {
      if (key in topics) {
        (allowedUpdates as any)[key] = (updates as any)[key];
      }
    }
    
    // Validate domainRole if it's being updated
    if (updates.domainRole) {
      const allowedDomainRoles = ["frontend", "backend", "devops", "qa", "hr"];
      allowedUpdates.domainRole = allowedDomainRoles.includes(updates.domainRole) 
        ? updates.domainRole 
        : "frontend";
    }
    
    const result = await db.update(topics)
      .set(allowedUpdates)
      .where(eq(topics.id, id))
      .returning();
      
    if (result.length === 0) {
      throw new Error('Topic not found');
    }
    
    return result[0] as Topic;
  }

  async deleteTopic(id: string): Promise<void> {
    await db.delete(topics).where(eq(topics.id, id));
  }

  // Progress tracking
  async createBuddyTopicProgress(progress: InsertBuddyTopicProgress): Promise<BuddyTopicProgress> {
    const result = await db.insert(buddyTopicProgress).values(progress).returning();
    return result[0];
  }

  // Resource management
  async getAllResources(filters?: { category?: string; difficulty?: string; type?: string; search?: string }): Promise<any[]> {
    let conditions = [];
    if (filters?.category && filters.category !== 'all') {
      conditions.push(eq(resources.category, filters.category));
    }
    if (filters?.difficulty && filters.difficulty !== 'all') {
      conditions.push(eq(resources.difficulty, filters.difficulty));
    }
    if (filters?.type && filters.type !== 'all') {
      conditions.push(eq(resources.type, filters.type));
    }
    if (filters?.search) {
      conditions.push(like(resources.title, `%${filters.search}%`));
    }
    let baseQuery = db.select().from(resources);
    const query = conditions.length > 0 ? baseQuery.where(and(...conditions)) : baseQuery;
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

  async getResourceById(id: string): Promise<any | undefined> {
    const result = await db.select().from(resources).where(eq(resources.id, id)).limit(1);
    return result[0];
  }

  async updateResource(id: string, updates: any): Promise<any> {
    const allowedUpdates: any = {};
    for (const key of Object.keys(updates)) {
      if (key in resources) {
        allowedUpdates[key] = updates[key];
      }
    }
    
    // Handle tags specially if they exist
    if (updates.tags) {
      allowedUpdates.tags = Array.isArray(updates.tags) 
        ? updates.tags 
        : (typeof updates.tags === 'string' ? updates.tags.split(',').map((t: string) => t.trim()) : []);
    }
    
    allowedUpdates.updatedAt = new Date();
    
    const result = await db.update(resources)
      .set(allowedUpdates)
      .where(eq(resources.id, id))
      .returning();
      
    if (result.length === 0) {
      throw new Error('Resource not found');
    }
    
    return result[0];
  }

  async deleteResource(id: string): Promise<void> {
    await db.delete(resources).where(eq(resources.id, id));
  }

  // Curriculum management
  async getAllCurriculum(filters?: { domain?: string; search?: string }): Promise<Curriculum[]> {
    let conditions = [];
    if (filters?.domain && filters.domain !== 'all') {
      conditions.push(eq(curriculum.domain, filters.domain as any));
    }
    if (filters?.search) {
      conditions.push(like(curriculum.title, `%${filters.search}%`));
    }
    let baseQuery = db.select().from(curriculum);
    const query = conditions.length > 0 ? baseQuery.where(and(...conditions)) : baseQuery;
    const result = await query;
    return result;
  }

  async getCurriculumById(id: string): Promise<Curriculum | undefined> {
    const result = await db.select().from(curriculum).where(eq(curriculum.id, id)).limit(1);
    return result[0];
  }

  async createCurriculum(insertCurriculum: InsertCurriculum): Promise<Curriculum> {
    const now = new Date();
    // Ensure domain is one of the allowed values
    const allowedDomains = ["frontend", "backend", "devops", "qa", "hr"];
    const domain = typeof insertCurriculum.domain === "string" && allowedDomains.includes(insertCurriculum.domain) 
      ? insertCurriculum.domain 
      : "frontend";
    
    const insertData = {
      ...insertCurriculum,
      domain, // Use the validated domain
      createdAt: now,
      updatedAt: now,
    };
    const result = await db.insert(curriculum).values(insertData).returning();
    return result[0];
  }

  async updateCurriculum(id: string, updates: Partial<Curriculum>): Promise<Curriculum> {
    const allowedUpdates: Partial<Curriculum> = {};
    for (const key of Object.keys(updates)) {
      if (key in curriculum) {
        (allowedUpdates as any)[key] = (updates as any)[key];
      }
    }
    
    // Validate domain if it's being updated
    if (updates.domain) {
      const allowedDomains = ["frontend", "backend", "devops", "qa", "hr"];
      allowedUpdates.domain = allowedDomains.includes(updates.domain) 
        ? updates.domain 
        : "frontend";
    }
    
    const result = await db.update(curriculum)
      .set({
        ...allowedUpdates,
        updatedAt: new Date()
      })
      .where(eq(curriculum.id, id))
      .returning();
    if (result.length === 0) {
      throw new Error('Curriculum not found');
    }
    return result[0];
  }

  async deleteCurriculum(id: string): Promise<void> {
    await db.delete(curriculum).where(eq(curriculum.id, id));
  }
}