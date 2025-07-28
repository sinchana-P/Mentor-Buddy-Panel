// API configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// Role types
export const ROLES = {
  MANAGER: 'manager',
  MENTOR: 'mentor',
  BUDDY: 'buddy',
};

// Domain roles
export const DOMAIN_ROLES = {
  FRONTEND: 'frontend',
  BACKEND: 'backend',
  DEVOPS: 'devops',
  QA: 'qa',
  HR: 'hr',
};

// Status types
export const STATUS_TYPES = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  EXITED: 'exited',
};

// Task status types
export const TASK_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  OVERDUE: 'overdue',
};