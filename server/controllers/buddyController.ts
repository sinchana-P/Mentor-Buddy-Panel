import { Request, Response } from 'express';
import { storage } from '../storage';
import { insertBuddySchema } from '../shared/schema';
import { z } from 'zod';

export const getAllBuddies = async (req: Request, res: Response) => {
  try {
    const { status, domain, search } = req.query;
    const buddies = await storage.getAllBuddies({
      status: status as string,
      domain: domain as string,
      search: search as string
    });
    res.json(buddies);
  } catch (error) {
    console.error('Error fetching buddies:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getBuddyById = async (req: Request, res: Response) => {
  try {
    const buddy = await storage.getBuddyById(req.params.id);
    if (!buddy) {
      return res.status(404).json({ message: "Buddy not found" });
    }
    res.json(buddy);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createBuddy = async (req: Request, res: Response) => {
  try {
    console.log('[POST /api/buddies] Creating new buddy:', req.body);
    const { name, email, domainRole } = req.body;
    
    // Create user first
    const user = await storage.createUser({
      email,
      name,
      role: 'buddy',
      domainRole
    });
    
    console.log('[POST /api/buddies] User created:', user.id);
    
    // Create buddy profile
    const buddy = await storage.createBuddy({
      userId: user.id,
      status: 'active'
    });
    
    console.log('[POST /api/buddies] Buddy created:', buddy.id);
    
    res.json({ 
      id: buddy.id,
      user: {
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl
      },
      mentor: null,
      domainRole: user.domainRole,
      status: buddy.status,
      startDate: buddy.createdAt
    });
  } catch (error) {
    console.error('Error creating buddy:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateBuddy = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const buddyData = req.body;
    const buddy = await storage.updateBuddy(id, buddyData);
    if (!buddy) {
      return res.status(404).json({ message: "Buddy not found" });
    }
    res.json(buddy);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const assignBuddyToMentor = async (req: Request, res: Response) => {
  try {
    const { mentorId } = req.body;
    const buddy = await storage.assignBuddyToMentor(req.params.id, mentorId);
    res.json(buddy);
  } catch (error) {
    console.error('Error assigning buddy to mentor:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getBuddyTasks = async (req: Request, res: Response) => {
  try {
    const tasks = await storage.getBuddyTasks(req.params.id);
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getBuddyProgress = async (req: Request, res: Response) => {
  try {
    const progress = await storage.getBuddyProgress(req.params.id);
    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateBuddyProgress = async (req: Request, res: Response) => {
  try {
    const { checked } = req.body;
    const progress = await storage.updateBuddyTopicProgress(
      req.params.buddyId,
      req.params.topicId,
      checked
    );
    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getBuddyPortfolio = async (req: Request, res: Response) => {
  try {
    const portfolio = await storage.getBuddyPortfolio(req.params.id);
    res.json(portfolio);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};