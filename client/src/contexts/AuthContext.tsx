import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, AuthUser } from '@/lib/supabase';

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<{ error?: string }>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signInWithMagicLink: (email: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  updateUserRole: (role: 'manager' | 'mentor' | 'buddy', domainRole?: string) => Promise<{ error?: string }>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      if (session?.user) {
        await fetchUserProfile(session.user.id);
      }
      setLoading(false);
    };

    getSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      if (session?.user) {
        await fetchUserProfile(session.user.id);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('Fetching user profile for ID:', userId);
      
      // First check if we have a local mapping
      const mapping = localStorage.getItem('supabase_user_mapping');
      let localUserId = userId;
      
      if (mapping) {
        const parsed = JSON.parse(mapping);
        if (parsed.supabaseId === userId) {
          localUserId = parsed.localUserId;
          console.log('Using mapped local user ID:', localUserId);
        }
      }
      
      const response = await fetch(`/api/users/${localUserId}`);
      if (response.ok) {
        const userData = await response.json();
        console.log('User profile fetched successfully:', userData);
        setUser(userData);
      } else {
        console.log('User profile not found, response status:', response.status);
        
        // Check if we have cached profile data
        const cachedProfile = localStorage.getItem('user_profile');
        if (cachedProfile) {
          const profileData = JSON.parse(cachedProfile);
          console.log('Using cached profile:', profileData);
          setUser(profileData);
          return;
        }
        
        // If user doesn't exist, try to get user info from Supabase session
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          console.log('Creating new user profile for:', session.user);
          await createUserProfileFromSession(session.user);
        }
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const createUserProfileFromSession = async (supabaseUser: any) => {
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: supabaseUser.email,
          name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'User',
          role: 'buddy', // Default role
          domainRole: 'frontend', // Default domain role
        }),
      });

      if (response.ok) {
        const userData = await response.json();
        console.log('User profile created successfully:', userData);
        setUser(userData);
        
        // Store the mapping between Supabase ID and our user ID
        localStorage.setItem('user_profile', JSON.stringify(userData));
        localStorage.setItem('supabase_user_mapping', JSON.stringify({
          supabaseId: supabaseUser.id,
          localUserId: userData.id
        }));
      } else {
        console.error('Failed to create user profile:', await response.text());
      }
    } catch (error) {
      console.error('Error creating user profile:', error);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });

    if (error) {
      return { error: error.message };
    }

    // Create user profile
    if (data.user) {
      try {
        const response = await fetch('/api/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            name,
            role: 'buddy', // Default role
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to create user profile');
        }
      } catch (error) {
        console.error('Error creating user profile:', error);
      }
    }

    return {};
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { error: error.message };
    }

    return {};
  };

  const signInWithMagicLink = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (error) {
      return { error: error.message };
    }

    return {};
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    // Clear cached data
    localStorage.removeItem('user_profile');
    localStorage.removeItem('supabase_user_mapping');
    setUser(null);
    setSession(null);
  };

  const updateUserRole = async (role: 'manager' | 'mentor' | 'buddy', domainRole?: string) => {
    if (!user) return { error: 'No user logged in' };

    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role,
          domainRole,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update user role');
      }

      const updatedUser = await response.json();
      setUser(updatedUser);

      return {};
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to update role' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signUp,
        signIn,
        signInWithMagicLink,
        signOut,
        updateUserRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}


