// Environment configuration
export const config = {
  // Database Configuration
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:SinchanaPGudagi@db.fbxmsxjbrffgejwgskeg.supabase.co:5432/postgres',
  
  // Supabase Configuration
  SUPABASE_URL: process.env.VITE_SUPABASE_URL || 'https://fbxmsxjbrffgejwgskeg.supabase.co',
  SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZieG1zeGpicmZmZ2Vqd2dza2VnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0OTM1NTMsImV4cCI6MjA2OTA2OTU1M30.o9yQ-9YlNuEHwLBokKodHkB2GFR8NbUkRtGzDfEWOik',
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZieG1zeGpicmZmZ2Vqd2dza2VnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzQ5MzU1MywiZXhwIjoyMDY5MDY5NTUzfQ.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8',
  
  // Server Configuration
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3000', 10),
  HOST: process.env.HOST || 'localhost',
  
  // Session Configuration
  SESSION_SECRET: process.env.SESSION_SECRET || 'your-super-secret-session-key-change-this-in-production',
  
  // CORS Configuration
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
  
  // Development Configuration
  VITE_API_URL: process.env.VITE_API_URL || 'http://localhost:3000',
};