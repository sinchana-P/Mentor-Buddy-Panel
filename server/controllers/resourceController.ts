import { Request, Response } from 'express';
import { storage } from '../storage';
import { insertResourceSchema } from '../shared/schema';

export const getAllResources = async (req: Request, res: Response) => {
  try {
    const { category, difficulty, type, search } = req.query;
    const resources = await storage.getAllResources({
      category: category as string,
      difficulty: difficulty as string,
      type: type as string,
      search: search as string
    });
    res.json(resources);
  } catch (error) {
    console.error('Error fetching resources:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getResourceById = async (req: Request, res: Response) => {
  try {
    const resource = await storage.getResourceById(req.params.id);
    if (!resource) {
      return res.status(404).json({ message: "Resource not found" });
    }
    res.json(resource);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createResource = async (req: Request, res: Response) => {
  try {
    const resourceData = insertResourceSchema.parse(req.body);
    const resource = await storage.createResource(resourceData);
    res.status(201).json(resource);
  } catch (error) {
    console.error('Error creating resource:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateResource = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const resourceData = req.body;
    const resource = await storage.updateResource(id, resourceData);
    if (!resource) {
      return res.status(404).json({ message: "Resource not found" });
    }
    res.json(resource);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteResource = async (req: Request, res: Response) => {
  try {
    await storage.deleteResource(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};