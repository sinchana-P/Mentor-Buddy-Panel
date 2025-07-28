// User types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'manager' | 'mentor' | 'buddy';
  domainRole: DomainRole;
  avatarUrl?: string;
  createdAt: string;
}

// Mentor types
export interface Mentor {
  id: string;
  userId: string;
  user: {
    name: string;
    email: string;
    avatarUrl?: string;
  };
  expertise: string[];
  buddiesCount: number;
  domainRole: string;
  status: 'active' | 'inactive';
}

// Buddy types
export interface Buddy {
  id: string;
  userId: string;
  user: {
    name: string;
    email: string;
    avatarUrl?: string;
  };
  mentor: {
    id: string;
    name: string;
  } | null;
  domainRole: DomainRole;
  status: 'active' | 'inactive' | 'exited';
  startDate: string;
  stats: {
    completedTasks: number;
    totalTasks: number;
  };
}

// Task types
export interface Task {
  id: string;
  mentorId: string;
  buddyId: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  dueDate: string | null;
  createdAt: string;
  submissions?: Submission[];
}

// Submission types
export interface Submission {
  id: string;
  taskId: string;
  buddyId: string;
  githubLink?: string;
  deployedUrl?: string;
  notes?: string;
  feedback?: string;
  createdAt: string;
}

// Topic types
export interface Topic {
  id: string;
  name: string;
  category: string;
  domainRole: DomainRole;
}

// Progress types
export interface BuddyTopicProgress {
  buddyId: string;
  topicId: string;
  topicName: string;
  category: string;
  checked: boolean;
}

// Portfolio item types
export interface PortfolioItem {
  id: string;
  title: string;
  description?: string;
  githubLink?: string;
  deployedUrl?: string;
  completedAt: string;
  technologies?: string[];
}

// Resource types
export interface Resource {
  id: string;
  title: string;
  description: string;
  url: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  type: 'article' | 'video' | 'course' | 'documentation' | 'tool';
  tags: string[];
  createdAt: string;
}

// Curriculum types
export interface Curriculum {
  id: string;
  title: string;
  description: string;
  domain: 'frontend' | 'backend' | 'devops' | 'qa' | 'hr';
  createdBy: string;
  content: string;
  attachments?: string;
  createdAt: string;
  updatedAt: string;
}

export type DomainRole = 'frontend' | 'backend' | 'devops' | 'qa' | 'hr';