import { Request, Response } from 'express';
import { storage } from '../storage';
import { insertTopicSchema } from '../shared/schema';

export const getAllTopics = async (req: Request, res: Response) => {
  try {
    const topics = await storage.getAllTopics();
    res.json(topics);
  } catch (error) {
    console.error('Error fetching topics:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getTopicById = async (req: Request, res: Response) => {
  try {
    const topic = await storage.getTopicById(req.params.id);
    if (!topic) {
      return res.status(404).json({ message: "Topic not found" });
    }
    res.json(topic);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createTopic = async (req: Request, res: Response) => {
  try {
    const topicData = insertTopicSchema.parse(req.body);
    const topic = await storage.createTopic(topicData);
    res.status(201).json(topic);
  } catch (error) {
    console.error('Error creating topic:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateTopic = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const topicData = req.body;
    const topic = await storage.updateTopic(id, topicData);
    if (!topic) {
      return res.status(404).json({ message: "Topic not found" });
    }
    res.json(topic);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteTopic = async (req: Request, res: Response) => {
  try {
    await storage.deleteTopic(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};