# Mentor-Buddy Panel

## Overview

This is a role-based mentoring platform built with a modern full-stack architecture. The application enables mentors to guide buddies through their learning journey with features including task management, progress tracking, and portfolio development. The system supports three primary roles: managers, mentors, and buddies, each with specific domain expertise (frontend, backend, devops, qa, hr).

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: React Context API for authentication and global state
- **UI Framework**: Tailwind CSS with shadcn/ui components (dark theme focus)
- **Animations**: Framer Motion for smooth transitions and micro-interactions
- **Build Tool**: Vite for fast development and optimized builds
- **Responsive Design**: Mobile-first approach with custom hooks for device detection

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **API Pattern**: RESTful API with structured route handlers
- **Development**: Hot reload with Vite middleware integration
- **Error Handling**: Centralized error middleware with structured responses

### Data Layer
- **ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL (configured for both local and production)
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Schema Management**: Drizzle-kit for migrations and schema evolution
- **Validation**: Zod for runtime type validation and schema inference

### Authentication & Authorization
- **Authentication Provider**: Supabase Auth
- **Authentication Methods**: Email/password and magic link support
- **Role-Based Access**: Three-tier role system (manager, mentor, buddy)
- **Domain Specialization**: Five domain roles (frontend, backend, devops, qa, hr)
- **Session Management**: Supabase session handling with React Context

## Key Components

### User Management System
- Multi-step registration with role selection
- Profile management with avatar support
- Role-based dashboard customization
- Domain expertise tracking

### Mentoring System
- **Mentor Profiles**: Expertise tracking, response rates, buddy assignment management
- **Buddy Profiles**: Progress tracking, mentor assignment, status management (active/inactive/exited)
- **Relationship Management**: One-to-many mentor-buddy relationships

### Task & Progress Management
- **Daily Task System**: Mentors create daily tasks with descriptions and due dates
- **Submission System**: Buddies submit work via GitHub links, deployed URLs, or file attachments
- **Comment System**: Chat-style feedback mechanism between mentors and buddies
- **Technical Checklist**: Skill-based progress tracking with mentor-controlled checkboxes

### Portfolio System
- **Work Portfolio**: Aggregated view of completed tasks and submissions
- **Technology Tracking**: Tags and categories for technical skills
- **Progress Visualization**: Charts and metrics for learning progression

### Dashboard & Analytics
- **Role-Specific Dashboards**: Customized views for managers, mentors, and buddies
- **Statistics Cards**: Key metrics with animated counters
- **Recent Activity**: Timeline-based activity feeds
- **Filter & Search**: Advanced filtering for mentors and buddies

## Data Flow

### Authentication Flow
1. User registers/signs in via Supabase Auth
2. Role selection screen for new users
3. Profile creation in local database
4. Role-based dashboard redirect

### Mentoring Workflow
1. Manager assigns buddies to mentors
2. Mentor creates daily tasks for assigned buddies
3. Buddy views tasks and submits work
4. Mentor reviews submissions and provides feedback
5. Progress tracking via technical checklist updates
6. Portfolio automatically builds from completed work

### Data Synchronization
- Supabase handles authentication state
- Local database stores application-specific data
- React Query manages server state and caching
- Optimistic updates for better user experience

## External Dependencies

### Core Infrastructure
- **Supabase**: Authentication, real-time subscriptions (configured but not fully implemented)
- **Neon Database**: PostgreSQL hosting with connection pooling
- **Vercel/Netlify Ready**: Static build output for easy deployment

### UI & Experience
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first styling framework
- **Framer Motion**: Animation library for smooth interactions
- **Lucide React**: Consistent icon system

### Development Tools
- **TypeScript**: Type safety across the entire stack
- **ESLint/Prettier**: Code quality and formatting
- **React Query**: Server state management and caching
- **Zod**: Runtime validation and type inference

## Deployment Strategy

### Development Environment
- Vite dev server with HMR
- Express API server with middleware integration
- Database migrations via Drizzle-kit
- Environment variable management for API keys

### Production Build
- Vite builds optimized React bundle to `dist/public`
- ESBuild compiles server code to `dist/index.js`
- Static file serving via Express in production
- Database connection via environment variables

### Environment Configuration
- Development: Local database or Neon connection
- Production: Neon PostgreSQL with connection pooling
- Supabase: Consistent across all environments
- Environment variables for API keys and database URLs

### Scalability Considerations
- Serverless-ready architecture
- Connection pooling for database efficiency
- Static asset optimization via Vite
- Lazy loading for large component trees