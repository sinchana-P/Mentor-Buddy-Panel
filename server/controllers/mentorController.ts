import { Request, Response } from 'express';
import { storage } from '../storage';
import { insertMentorSchema } from '../shared/schema';
import { z } from 'zod';

export const getAllMentors = async (req: Request, res: Response) => {
  try {
    console.log('[GET /api/mentors] Fetching all mentors...');
    const { domain, search } = req.query;
    const mentors = await storage.getAllMentors({
      domain: domain as string,
      search: search as string
    });
    res.json(mentors);
  } catch (error) {
    console.error('Error fetching mentors:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getMentorById = async (req: Request, res: Response) => {
  try {
    const mentor = await storage.getMentorById(req.params.id);
    if (!mentor) {
      return res.status(404).json({ message: "Mentor not found" });
    }
    res.json(mentor);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createMentor = async (req: Request, res: Response) => {
  try {
    console.log('[POST /api/mentors] Creating new mentor:', req.body);
    const { name, email, domainRole, expertise, experience } = req.body;
    
    // Basic validation
    if (!name || !email || !domainRole) {
      return res.status(400).json({ 
        message: "Invalid mentor data", 
        errors: [
          { field: "name", message: !name ? "Name is required" : undefined },
          { field: "email", message: !email ? "Email is required" : undefined },
          { field: "domainRole", message: !domainRole ? "Domain role is required" : undefined }
        ].filter(e => e.message)
      });
    }
    
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        message: "Invalid mentor data", 
        errors: [{ field: "email", message: "Invalid email format" }]
      });
    }
    
    // Domain role validation
    const validDomainRoles = ['frontend', 'backend', 'devops', 'qa', 'hr'];
    const normalizedDomainRole = domainRole.toLowerCase();
    if (!validDomainRoles.includes(normalizedDomainRole)) {
      return res.status(400).json({ 
        message: "Invalid mentor data", 
        errors: [{ field: "domainRole", message: "Invalid domain role" }]
      });
    }
    
    try {
      // Create user first
      console.log('[POST /api/mentors] Creating user with data:', { email, name, role: 'mentor', domainRole: normalizedDomainRole });
      const user = await storage.createUser({
        email,
        name,
        role: 'mentor',
        domainRole: normalizedDomainRole
      });
      
      console.log('[POST /api/mentors] User created:', user);
      console.log('[POST /api/mentors] User ID:', user.id, 'Type:', typeof user.id);
      
      if (!user || !user.id) {
        return res.status(400).json({ 
          message: "Invalid mentor data", 
          errors: [{ field: "userId", message: "Failed to create user account" }]
        });
      }
      
      // Create mentor with proper userId
      const mentorData = {
        userId: user.id as string,
        expertise: expertise || '',
        experience: experience || '',
        responseRate: 0,
        isActive: true
      };
      
      console.log('[POST /api/mentors] Mentor data to be inserted:', JSON.stringify(mentorData));
      
      // Create mentor profile
      const mentor = await storage.createMentor(mentorData);
      
      console.log('[POST /api/mentors] Mentor created:', mentor.id);
      
      res.json({ 
        id: mentor.id,
        user: {
          name: user.name,
          email: user.email,
          avatarUrl: user.avatarUrl
        },
        expertise: mentor.expertise,
        experience: mentor.experience,
        domainRole: user.domainRole,
        buddiesCount: 0
      });
    } catch (validationError: any) {
      console.error('[POST /api/mentors] Validation error:', validationError);
      if (validationError.code === 'DUPLICATE_EMAIL') {
        return res.status(400).json({ message: "Email already exists" });
      }
      if (validationError.code === 'INVALID_MENTOR_DATA') {
        return res.status(400).json({ 
          message: "Invalid mentor data", 
          errors: [{ field: "userId", message: validationError.message }]
        });
      }
      if (validationError.code === 'USER_NOT_FOUND') {
        return res.status(400).json({ 
          message: "Invalid mentor data", 
          errors: [{ field: "userId", message: "User not found" }]
        });
      }
      if (validationError.errors) {
        return res.status(400).json({ message: "Invalid mentor data", errors: validationError.errors });
      }
      throw validationError; // Re-throw if it's not a validation error we can handle
    }
  } catch (error) {
    console.error('Error creating mentor:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateMentor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const mentorData = req.body;
    const mentor = await storage.updateMentor(id, mentorData);
    if (!mentor) {
      return res.status(404).json({ message: "Mentor not found" });
    }
    res.json(mentor);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteMentor = async (req: Request, res: Response) => {
  try {
    await storage.deleteMentor(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getMentorBuddies = async (req: Request, res: Response) => {
  try {
    const { status } = req.query;
    const buddies = await storage.getMentorBuddies(req.params.id, status as string);
    res.json(buddies);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};