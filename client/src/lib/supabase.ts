/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://fbxmsxjbrffgejwgskeg.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZieG1zeGpicmZmZ2Vqd2dza2VnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0OTM1NTMsImV4cCI6MjA2OTA2OTU1M30.o9yQ-9YlNuEHwLBokKodHkB2GFR8NbUkRtGzDfEWOik';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type AuthUser = {
  id: string;
  email: string;
  name?: string;
  role?: 'manager' | 'mentor' | 'buddy';
  domainRole?: 'frontend' | 'backend' | 'devops' | 'qa' | 'hr';
  avatarUrl?: string;
};
