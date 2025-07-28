import { Request, Response } from 'express';
import { storage } from '../storage';
import { insertTaskSchema, insertSubmissionSchema } from '../shared/schema';

export const getAllTasks = async (req: Request, res: Response) => {
  try {
    const tasks = await storage.getAllTasks();
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getTaskById = async (req: Request, res: Response) => {
  try {
    const task = await storage.getTaskById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createTask = async (req: Request, res: Response) => {
  try {
    const taskData = insertTaskSchema.parse(req.body);
    const task = await storage.createTask(taskData);
    res.status(201).json(task);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const taskData = req.body;
    const task = await storage.updateTask(id, taskData);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteTask = async (req: Request, res: Response) => {
  try {
    await storage.deleteTask(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createSubmission = async (req: Request, res: Response) => {
  try {
    const submissionData = insertSubmissionSchema.parse(req.body);
    const submission = await storage.createSubmission(submissionData);
    res.status(201).json(submission);
  } catch (error) {
    console.error('Error creating submission:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getSubmissionsByTaskId = async (req: Request, res: Response) => {
  try {
    const submissions = await storage.getSubmissionsByTaskId(req.params.taskId);
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};