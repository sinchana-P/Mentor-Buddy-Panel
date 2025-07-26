CREATE TABLE "buddies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"assigned_mentor_id" uuid,
	"status" text DEFAULT 'active',
	"join_date" timestamp DEFAULT now() NOT NULL,
	"progress" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "buddy_topic_progress" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"buddy_id" uuid NOT NULL,
	"topic_id" uuid NOT NULL,
	"checked" boolean DEFAULT false,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "mentors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"expertise" text NOT NULL,
	"experience" text NOT NULL,
	"response_rate" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"buddy_id" uuid NOT NULL,
	"task_id" uuid NOT NULL,
	"github_link" text,
	"deployed_url" text,
	"notes" text,
	"feedback" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mentor_id" uuid NOT NULL,
	"buddy_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"due_date" timestamp,
	"status" text DEFAULT 'pending',
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "topics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"domain_role" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"role" text NOT NULL,
	"domain_role" text,
	"avatar_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "buddies" ADD CONSTRAINT "buddies_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "buddies" ADD CONSTRAINT "buddies_assigned_mentor_id_mentors_id_fk" FOREIGN KEY ("assigned_mentor_id") REFERENCES "public"."mentors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "buddy_topic_progress" ADD CONSTRAINT "buddy_topic_progress_buddy_id_buddies_id_fk" FOREIGN KEY ("buddy_id") REFERENCES "public"."buddies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "buddy_topic_progress" ADD CONSTRAINT "buddy_topic_progress_topic_id_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mentors" ADD CONSTRAINT "mentors_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_buddy_id_buddies_id_fk" FOREIGN KEY ("buddy_id") REFERENCES "public"."buddies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_mentor_id_mentors_id_fk" FOREIGN KEY ("mentor_id") REFERENCES "public"."mentors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_buddy_id_buddies_id_fk" FOREIGN KEY ("buddy_id") REFERENCES "public"."buddies"("id") ON DELETE no action ON UPDATE no action;