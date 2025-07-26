-- Mentor-Buddy Platform Database Schema
-- Execute this directly in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('manager', 'mentor', 'buddy')),
    domain_role VARCHAR(50) NOT NULL CHECK (domain_role IN ('frontend', 'backend', 'devops', 'qa', 'hr')),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Mentors table
CREATE TABLE IF NOT EXISTS mentors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    bio TEXT,
    expertise TEXT[] NOT NULL DEFAULT '{}',
    response_rate INTEGER DEFAULT 0 CHECK (response_rate >= 0 AND response_rate <= 100),
    is_active BOOLEAN DEFAULT true
);

-- Buddies table
CREATE TABLE IF NOT EXISTS buddies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assigned_mentor_id UUID REFERENCES mentors(id),
    domain_role VARCHAR(50) NOT NULL CHECK (domain_role IN ('frontend', 'backend', 'devops', 'qa', 'hr')),
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'exited')),
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Topics table
CREATE TABLE IF NOT EXISTS topics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    domain_role VARCHAR(50) NOT NULL CHECK (domain_role IN ('frontend', 'backend', 'devops', 'qa', 'hr'))
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    mentor_id UUID NOT NULL REFERENCES mentors(id) ON DELETE CASCADE,
    buddy_id UUID NOT NULL REFERENCES buddies(id) ON DELETE CASCADE,
    due_date TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) CHECK (status IN ('pending', 'in_progress', 'completed', 'overdue')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Submissions table
CREATE TABLE IF NOT EXISTS submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    buddy_id UUID NOT NULL REFERENCES buddies(id) ON DELETE CASCADE,
    github_link TEXT,
    deployed_url TEXT,
    notes TEXT,
    feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Buddy topic progress table
CREATE TABLE IF NOT EXISTS buddy_topic_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    buddy_id UUID NOT NULL REFERENCES buddies(id) ON DELETE CASCADE,
    topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    checked BOOLEAN DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(buddy_id, topic_id)
);

-- Insert sample data
INSERT INTO users (id, email, name, role, domain_role) VALUES 
('1a11c298-2293-4654-ab53-bdc648218570', 'test@example.com', 'Test User', 'mentor', 'frontend')
ON CONFLICT (id) DO NOTHING;

INSERT INTO mentors (id, user_id, bio, expertise, response_rate, is_active) VALUES 
('11111111-1111-1111-1111-111111111111', '1a11c298-2293-4654-ab53-bdc648218570', 'Experienced frontend developer', ARRAY['React', 'TypeScript', 'JavaScript'], 95, true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO buddies (id, user_id, assigned_mentor_id, domain_role, status, start_date) VALUES 
('22222222-2222-2222-2222-222222222222', '1a11c298-2293-4654-ab53-bdc648218570', '11111111-1111-1111-1111-111111111111', 'frontend', 'active', '2024-01-15')
ON CONFLICT (id) DO NOTHING;

INSERT INTO topics (id, name, category, domain_role) VALUES 
('33333333-3333-3333-3333-333333333333', 'HTML Fundamentals', 'basics', 'frontend'),
('44444444-4444-4444-4444-444444444444', 'CSS Styling', 'basics', 'frontend'),
('55555555-5555-5555-5555-555555555555', 'JavaScript ES6+', 'intermediate', 'frontend'),
('66666666-6666-6666-6666-666666666666', 'React Components', 'advanced', 'frontend'),
('77777777-7777-7777-7777-777777777777', 'State Management', 'advanced', 'frontend')
ON CONFLICT (id) DO NOTHING;

INSERT INTO tasks (id, title, description, mentor_id, buddy_id, due_date, status) VALUES 
('88888888-8888-8888-8888-888888888888', 'Build a Todo App', 'Create a simple todo application using React with add, edit, and delete functionality.', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', CURRENT_TIMESTAMP + INTERVAL '7 days', 'pending'),
('99999999-9999-9999-9999-999999999999', 'Learn CSS Flexbox', 'Complete exercises on CSS Flexbox layout and create a responsive navigation bar.', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', CURRENT_TIMESTAMP + INTERVAL '3 days', 'in_progress')
ON CONFLICT (id) DO NOTHING;