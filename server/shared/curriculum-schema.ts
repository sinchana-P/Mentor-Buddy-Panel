import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./schema";

export const curriculum = pgTable("curriculum", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  domain: text("domain", { enum: ["frontend", "backend", "devops", "qa", "hr"] }).notNull(),
  createdBy: uuid("created_by").references(() => users.id).notNull(),
  content: text("content").notNull(),
  attachments: text("attachments"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Insert schema
export const insertCurriculumSchema = createInsertSchema(curriculum).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type Curriculum = typeof curriculum.$inferSelect;
export type InsertCurriculum = z.infer<typeof insertCurriculumSchema>;