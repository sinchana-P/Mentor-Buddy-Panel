import { Request, Response } from 'express';
import { storage } from '../storage';
import { insertCurriculumSchema } from '../shared/curriculum-schema';
import { z } from 'zod';

export const getAllCurriculum = async (req: Request, res: Response) => {
  try {
    console.log('[GET /api/curriculum] Fetching all curriculum items...');
    const { domain, search } = req.query;
    const curriculumItems = await storage.getAllCurriculum({
      domain: domain as string,
      search: search as string
    });
    res.json(curriculumItems);
  } catch (error) {
    console.error('Error fetching curriculum:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getCurriculumById = async (req: Request, res: Response) => {
  try {
    console.log(`[GET /api/curriculum/${req.params.id}] Fetching curriculum item...`);
    const curriculumItem = await storage.getCurriculumById(req.params.id);
    if (!curriculumItem) {
      return res.status(404).json({ message: "Curriculum item not found" });
    }
    res.json(curriculumItem);
  } catch (error) {
    console.error(`Error fetching curriculum item:`, error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createCurriculum = async (req: Request, res: Response) => {
  try {
    console.log('[POST /api/curriculum] Creating new curriculum item:', req.body);
    const curriculumData = insertCurriculumSchema.parse(req.body);
    const curriculumItem = await storage.createCurriculum(curriculumData);
    console.log('[POST /api/curriculum] Curriculum item created:', curriculumItem.id);
    res.status(201).json(curriculumItem);
  } catch (error) {
    console.error('Error creating curriculum item:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid curriculum data", errors: error.issues });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateCurriculum = async (req: Request, res: Response) => {
  try {
    console.log(`[PATCH /api/curriculum/${req.params.id}] Updating curriculum item:`, req.body);
    const updates = req.body;
    const curriculumItem = await storage.updateCurriculum(req.params.id, updates);
    console.log(`[PATCH /api/curriculum/${req.params.id}] Curriculum item updated`);
    res.json(curriculumItem);
  } catch (error) {
    console.error('Error updating curriculum item:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteCurriculum = async (req: Request, res: Response) => {
  try {
    console.log(`[DELETE /api/curriculum/${req.params.id}] Deleting curriculum item...`);
    await storage.deleteCurriculum(req.params.id);
    console.log(`[DELETE /api/curriculum/${req.params.id}] Curriculum item deleted`);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting curriculum item:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};