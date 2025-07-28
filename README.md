# Mentor-Buddy Panel

A comprehensive role-based mentoring platform built with React, TypeScript, and Supabase.

## 🚀 Features

- **Authentication**: Login/Signup with Supabase Auth
- **Role Management**: Manager, Mentor, and Buddy roles
- **Dashboard**: Overview of mentoring activities and statistics
- **Mentor Management**: Create and manage mentor profiles
- **Buddy Management**: Track buddy progress and development
- **Task Management**: Assign and track tasks between mentors and buddies
- **Progress Tracking**: Monitor learning progress with checklists
- **Portfolio**: Showcase completed work and projects

## 🛠️ Tech Stack

- **Frontend**: React + TypeScript
- **UI Framework**: Shadcn/ui components with Tailwind CSS
- **Backend**: Express.js with TypeScript
- **Database**: Supabase (PostgreSQL)
- **ORM**: Drizzle ORM
- **Authentication**: Supabase Auth
- **State Management**: React Query + React Context
- **Routing**: Wouter
- **Animations**: Framer Motion

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Git

## 🚀 Quick Start

### 1. Clone the repository
```bash
git clone <repository-url>
cd Mentor-Buddy-Panel
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up the database
```bash
# Run migrations to create tables
npx tsx server/migrate.ts

# Set up initial data
npx tsx server/setup-db.ts
```

### 4. Start the development server

#### Option A: Using the provided script (Recommended)
```bash
# On macOS/Linux
./start-dev.sh

# On Windows
start-dev.bat
```

#### Option B: Manual start
```bash
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000

## 🔧 Environment Variables

The project includes default environment variables, but you can override them by setting the following:

```bash
# Database
DATABASE_URL=postgresql://postgres:SinchanaPGudagi@db.fbxmsxjbrffgejwgskeg.supabase.co:5432/postgres

# Supabase
VITE_SUPABASE_URL=https://fbxmsxjbrffgejwgskeg.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Server
NODE_ENV=development
PORT=3000
HOST=localhost
SESSION_SECRET=your-session-secret
CORS_ORIGIN=http://localhost:5173
VITE_API_URL=http://localhost:3000
```

## 📁 Project Structure

```
Mentor-Buddy-Panel/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── contexts/      # React contexts
│   │   ├── hooks/         # Custom hooks
│   │   └── lib/           # Utilities and configurations
├── server/                # Backend Express application
│   ├── routes.ts          # API routes
│   ├── storage.ts         # Data storage layer
│   ├── db-storage.ts      # Database storage implementation
│   └── db.ts              # Database connection
├── shared/                # Shared types and schemas
│   └── schema.ts          # Database schema definitions
├── migrations/            # Database migrations
└── setup-supabase.sql     # Initial database setup
```

## 🗄️ Database Schema

The application uses the following main tables:

- **users**: User accounts and profiles
- **mentors**: Mentor-specific information
- **buddies**: Buddy profiles and assignments
- **tasks**: Tasks assigned by mentors to buddies
- **submissions**: Task submissions and feedback
- **topics**: Learning topics and categories
- **buddy_topic_progress**: Progress tracking for topics

## 🔐 Authentication

The application uses Supabase Auth with the following features:

- Email/password authentication
- Magic link authentication
- Role-based access control
- Session management

## 📱 Features by Role

### Manager
- View dashboard with overall statistics
- Manage mentors and buddies
- Monitor progress across all teams

### Mentor
- View assigned buddies
- Create and assign tasks
- Provide feedback on submissions
- Track buddy progress

### Buddy
- View assigned tasks
- Submit work and progress
- Track learning progress
- Build portfolio of completed work

## 🚀 Deployment

### Build for production
```bash
npm run build
```

### Start production server
```bash
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues or have questions, please:

1. Check the existing issues
2. Create a new issue with detailed information
3. Include steps to reproduce the problem

## 🔄 Updates

To update the project:

```bash
git pull origin main
npm install
npm run db:push  # If there are new migrations
npm run dev
``` 