import { Request, Response } from 'express';
import { storage } from '../storage';
import { z } from 'zod';
import { DomainRole } from '@shared/schema';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    
    // In a real app, you would validate credentials against Supabase Auth
    // For now, just find the user by email
    const user = await storage.getUserByEmail(email);
    
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    
    // In a real app, you would verify the password here
    // For now, just return the user
    res.json({
      user,
      token: "mock-jwt-token" // In a real app, this would be a JWT from Supabase
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;
    
    // Check if user already exists
    const existingUser = await storage.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    
    // In a real app, you would create a user in Supabase Auth
    // For now, just create a user in the database
    const user = await storage.createUser({
      email,
      name,
      role: 'buddy', // Default role (changed from 'user' to 'buddy' which is an allowed role)
      domainRole: null as unknown as DomainRole
    });
    
    res.status(201).json({
      user,
      token: "mock-jwt-token" // In a real app, this would be a JWT from Supabase
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    // In a real app, you would get the user ID from the JWT
    // For now, just use the user ID from the request
    const userId = req.headers['user-id'] as string;
    
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateUserRole = async (req: Request, res: Response) => {
  try {
    const { userId, role, domainRole } = req.body;
    
    const user = await storage.updateUser(userId, { role, domainRole });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};