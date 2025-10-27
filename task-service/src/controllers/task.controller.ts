import { Request, Response } from "express";
import Task from "../models/task.model";

export const createTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, dueDate, priority, category } = req.body;

    const task = new Task({
      name,
      dueDate,
      priority,
      category
    });

    await task.save();
    res.status(201).json({ message: "Task created successfully", task });
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllTasks = async (_req: Request, res: Response): Promise<void> => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
