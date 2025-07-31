import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, uuid, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { curriculum, insertCurriculumSchema } from "./curriculum-schema";

// Clean union type for domain roles
export type DomainRole = 'frontend' | 'backend' | 'devops' | 'qa' | 'hr';

export const users = pgTable("users", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  role: text("role", { enum: ["manager", "mentor", "buddy"] }).notNull(),
  domainRole: text("domain_role", { enum: ["frontend", "backend", "devops", "qa", "hr"] }).notNull(),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const mentors = pgTable("mentors", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id).notNull(),
  expertise: text("expertise").notNull(),
  experience: text("experience").notNull(),
  responseRate: integer("response_rate").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const buddies = pgTable("buddies", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id).notNull(),
  assignedMentorId: uuid("assigned_mentor_id").references(() => mentors.id),
  status: text("status", { enum: ["active", "inactive", "exited"] }).default("active"),
  joinDate: timestamp("join_date").defaultNow().notNull(),
  progress: integer("progress").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const tasks = pgTable("tasks", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  mentorId: uuid("mentor_id").references(() => mentors.id).notNull(),
  buddyId: uuid("buddy_id").references(() => buddies.id).notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  dueDate: timestamp("due_date"),
  status: text("status", { enum: ["pending", "in_progress", "completed", "overdue"] }).default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const submissions = pgTable("submissions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  buddyId: uuid("buddy_id").references(() => buddies.id).notNull(),
  taskId: uuid("task_id").references(() => tasks.id).notNull(),
  githubLink: text("github_link"),
  deployedUrl: text("deployed_url"),
  notes: text("notes"),
  feedback: text("feedback"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const topics = pgTable("topics", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  category: text("category").notNull(),
  domainRole: text("domain_role", { enum: ["frontend", "backend", "devops", "qa", "hr"] }).notNull(),
});

export const buddyTopicProgress = pgTable("buddy_topic_progress", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  buddyId: uuid("buddy_id").references(() => buddies.id).notNull(),
  topicId: uuid("topic_id").references(() => topics.id).notNull(),
  checked: boolean("checked").default(false),
  completedAt: timestamp("completed_at"),
});

export const resources = pgTable('resources', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 255 }).notNull(),
  url: text('url').notNull(),
  description: text('description'),
  type: varchar('type', { length: 64 }),
  category: varchar('category', { length: 64 }),
  difficulty: varchar('difficulty', { length: 32 }),
  duration: varchar('duration', { length: 32 }),
  author: varchar('author', { length: 128 }),
  tags: jsonb('tags').$type<string[]>(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMentorSchema = createInsertSchema(mentors).omit({
  id: true,
  createdAt: true,
});

export const insertBuddySchema = createInsertSchema(buddies).omit({
  id: true,
  createdAt: true,
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
});

export const insertSubmissionSchema = createInsertSchema(submissions).omit({
  id: true,
  createdAt: true,
});

export const insertTopicSchema = createInsertSchema(topics).omit({
  id: true,
});

export const insertBuddyTopicProgressSchema = createInsertSchema(buddyTopicProgress).omit({
  id: true,
});

export const insertResourceSchema = createInsertSchema(resources).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type User = Omit<typeof users.$inferSelect, 'domainRole'> & { domainRole: DomainRole };
export type InsertUser = z.infer<typeof insertUserSchema> & { domainRole: DomainRole };
export type Mentor = typeof mentors.$inferSelect;
export type InsertMentor = z.infer<typeof insertMentorSchema>;
export type Buddy = typeof buddies.$inferSelect;
export type InsertBuddy = z.infer<typeof insertBuddySchema>;
export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Submission = typeof submissions.$inferSelect;
export type InsertSubmission = z.infer<typeof insertSubmissionSchema>;
export type Topic = Omit<typeof topics.$inferSelect, 'domainRole'> & { domainRole: DomainRole };
export type InsertTopic = z.infer<typeof insertTopicSchema> & { domainRole: DomainRole };
export type BuddyTopicProgress = typeof buddyTopicProgress.$inferSelect;
export type InsertBuddyTopicProgress = z.infer<typeof insertBuddyTopicProgressSchema>;
export type Resource = typeof resources.$inferSelect;
export type InsertResource = z.infer<typeof insertResourceSchema>;
// Re-export curriculum types
export { curriculum } from './curriculum-schema';
export type { Curriculum, InsertCurriculum } from './curriculum-schema';
