import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../shared/schema.js';
import { users, mentors, buddies, tasks, submissions, topics, buddyTopicProgress } from '../shared/schema.js';
import { eq } from 'drizzle-orm';

const connectionString = 'postgresql://postgres:SinchanaPGudagi@db.fbxmsxjbrffgejwgskeg.supabase.co:5432/postgres';

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

const db = drizzle(pool, { schema });

async function setupDatabase() {
  try {
    console.log('Setting up database tables...');
    
    // Create tables (this will be handled by migrations, but we'll ensure they exist)
    console.log('Database connection successful');
    
    // Insert sample topics
    const sampleTopics = [
      { name: 'React Fundamentals', category: 'Frontend Development', domainRole: 'frontend' as const },
      { name: 'TypeScript Basics', category: 'Programming', domainRole: 'frontend' as const },
      { name: 'Node.js & Express', category: 'Backend Development', domainRole: 'backend' as const },
      { name: 'Database Design', category: 'Backend Development', domainRole: 'backend' as const },
      { name: 'Docker Basics', category: 'DevOps', domainRole: 'devops' as const },
      { name: 'CI/CD Pipelines', category: 'DevOps', domainRole: 'devops' as const },
      { name: 'Testing Strategies', category: 'Quality Assurance', domainRole: 'qa' as const },
      { name: 'API Testing', category: 'Quality Assurance', domainRole: 'qa' as const },
      { name: 'Recruitment Process', category: 'Human Resources', domainRole: 'hr' as const },
      { name: 'Employee Onboarding', category: 'Human Resources', domainRole: 'hr' as const },
    ];

    for (const topic of sampleTopics) {
      await db.insert(topics).values(topic).onConflictDoNothing();
    }
    
    console.log('Sample topics inserted successfully');
    
    // Insert sample users
    const sampleUsers = [
      { email: 'manager@example.com', name: 'John Manager', role: 'manager' as const, domainRole: 'frontend' as const },
      { email: 'mentor1@example.com', name: 'Sarah Mentor', role: 'mentor' as const, domainRole: 'frontend' as const },
      { email: 'mentor2@example.com', name: 'Mike Mentor', role: 'mentor' as const, domainRole: 'backend' as const },
      { email: 'buddy1@example.com', name: 'Alice Buddy', role: 'buddy' as const, domainRole: 'frontend' as const },
      { email: 'buddy2@example.com', name: 'Bob Buddy', role: 'buddy' as const, domainRole: 'backend' as const },
    ];

    for (const user of sampleUsers) {
      await db.insert(users).values(user).onConflictDoNothing();
    }
    
    console.log('Sample users inserted successfully');
    
    // Get user IDs for creating mentors and buddies
    const mentorUser = await db.select().from(users).where(eq(users.email, 'mentor1@example.com')).limit(1);
    const buddyUser = await db.select().from(users).where(eq(users.email, 'buddy1@example.com')).limit(1);
    
    if (mentorUser.length > 0 && buddyUser.length > 0) {
      // Insert sample mentor
      const mentor = await db.insert(mentors).values({
        userId: mentorUser[0].id,
        expertise: 'React, TypeScript, Frontend Architecture',
        experience: '5+ years in frontend development',
        responseRate: 95,
        isActive: true
      }).returning();
      
      // Insert sample buddy
      await db.insert(buddies).values({
        userId: buddyUser[0].id,
        assignedMentorId: mentor[0].id,
        status: 'active',
        progress: 25
      });
      
      console.log('Sample mentor and buddy relationships created');
    }
    
    console.log('Database setup completed successfully!');
  } catch (error) {
    console.error('Error setting up database:', error);
  } finally {
    await pool.end();
  }
}

setupDatabase(); 