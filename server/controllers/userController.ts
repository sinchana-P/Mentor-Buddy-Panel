import { Request, Response } from 'express';
import { storage } from '../storage';
import { insertUserSchema } from '../shared/schema';

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    console.log('[GET /api/users] Fetching all users...');
    const users = await storage.getAllUsers();
    console.log('[GET /api/users] Users found:', users.length);
    res.json(users);
  } catch (error) {
    console.error('[GET /api/users] Error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    console.log(`[GET /api/users/${req.params.id}] Looking for user...`);
    const user = await storage.getUser(req.params.id);
    if (!user) {
      console.log(`[GET /api/users/${req.params.id}] User not found in storage`);
      return res.status(404).json({ message: "User not found" });
    }
    console.log(`[GET /api/users/${req.params.id}] User found:`, user);
    res.json(user);
  } catch (error) {
    console.error(`[GET /api/users/${req.params.id}] Error:`, error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    console.log('[POST /api/users] Creating user with data:', req.body);
    const userData = insertUserSchema.parse(req.body);
    const user = await storage.createUser(userData);
    console.log('[POST /api/users] User created successfully:', user);
    res.status(201).json(user);
  } catch (error) {
    console.error('[POST /api/users] Error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userData = req.body;
    const user = await storage.updateUser(id, userData);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await storage.deleteUser(id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};