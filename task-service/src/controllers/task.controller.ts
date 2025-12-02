import { Request, Response } from "express";
import jwt from 'jsonwebtoken';
import Task from "../models/task.model";
import CompletedTask from "../models/completedTask.model";
import * as taskService from '../services/taskService';
import * as userClient from '../clients/userClient';

export const createTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const { taskName, dueDate, priority, category, userEmail, description, isCompleted, reminder } = req.body;

    const task = new Task({
      taskName,
      dueDate,
      priority,
      category,
      userEmail,
      description,
      isCompleted,
      reminder: {
          enabled: req.body.reminder?.enabled ?? false,
          remindAt: req.body.reminder?.remindAt ?? null
      },
    });

    await task.save();
    res.status(201).json({ message: "Task created successfully", task });
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllTasks = async (req: Request, res: Response): Promise<void> => {
  try {
    // Allow filtering by userEmail query param
    const { userEmail } = req.query;
    const filter: any = {};
    if (userEmail) {
      filter.userEmail = String(userEmail);
    }
    const tasks = await Task.find(filter).sort({ createdAt: -1 });
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};


export const getPendingTasks = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.params;
    if (status == "pending") {
        const pendingTasks = await Task.find({ isCompleted: "false" }).sort({ createdAt: -1 });

        if (!pendingTasks || pendingTasks.length === 0) {
          res.status(404).json({ message: "No pending tasks found" });
          return;
        }
        res.status(200).json(pendingTasks);
    } else {
        const tasks = await Task.find().sort({ createdAt: -1 });
      res.status(200).json(tasks);
    }
      } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};


export const getTaskbyId = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log("Fetching task by ID:", req.params);
    const { id } = req.params;
    const task = await Task.findOne({ _id: id });
    if (!task) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};


export const updateTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedTask = await Task.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedTask) {
      res.status(404).json({ message: "Task not found" });
      return;
    }

    res.status(200).json(updatedTask);
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const deletedTask = await Task.findByIdAndDelete(id);

    if (!deletedTask) {
      res.status(404).json({ message: "Task not found" });
      return;
    }

    res.status(200).json({ message: "Task deleted successfully", task: deletedTask });
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const markTaskComplete = async (req: Request, res: Response): Promise<void> => {
  try {
    const id  = req.params.id;
    const { userEmail } = req.body;

    if (!id) {
      res.status(400).json({ message: 'Id is required' });
      return;
    }

    const result = await taskService.completeTask(id);

    try {
      await userClient.addReward(id, userEmail, result.points);
    } catch (err) {
      console.error('Failed to add reward to user:', (err as any).message || err);
    }

    res.status(200).json({ message: 'Task completed and moved to completed tasks', points: result.points });
  } catch (error) {
    console.error("Error completing task:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getTasksDueSoon = async (req: Request, res: Response): Promise<void> => {
  try {
    // +/- 240 minutes window
    const minutes = 480;

    const now = new Date();
    const lower = new Date(now.getTime() - minutes * 60 * 1000);
    const upper = new Date(now.getTime() + minutes * 60 * 1000);

    console.log("NOW:", now.toISOString());
    console.log("LOWER:", lower.toISOString());
    console.log("UPPER:", upper.toISOString());

    // Get all active tasks
    const tasks = await Task.find({ isCompleted: false });

    console.log("ALL ACTIVE TASKS:", tasks);

    // Filter tasks whose reminder is within +/- 4 hours
    const dueSoon = tasks.filter((t) => {
      if (!t.reminder?.enabled || !t.reminder?.remindAt) return false;

      const remindAt = new Date(t.reminder.remindAt);

      console.log(
        `remindAt: ${remindAt.toISOString()} | lower: ${lower.toISOString()} | upper: ${upper.toISOString()}`
      );

      return remindAt >= lower && remindAt <= upper;
    });

    console.log("---------------------------------------");
    console.log("DUE SOON TASKS:", dueSoon);

    res.status(200).json(dueSoon);
  } catch (error) {
    console.error("Error fetching tasks due soon:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getCompletedTasks = async (req: Request, res: Response): Promise<void> => {
  try {
    // If authorization header present, verify token and restrict to token userEmail
    const authHeader = req.headers.authorization || '';
    let tokenEmail: string | null = null;
    if (authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'default_secret');
        tokenEmail = decoded?.userEmail || null;
      } catch (e) {
        // Invalid token - ignore and fallback to query param if present
      }
    }
    const { userEmail } = req.query;
    const filter: any = {};
    // If tokenEmail exists, restrict to that user
    if (tokenEmail) filter.userEmail = String(tokenEmail);
    else if (userEmail) filter.userEmail = String(userEmail);
    else {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }
    const tasks = await CompletedTask.find(filter).sort({ completedAt: -1 });
    res.status(200).json(tasks);
  } catch (error) {
    console.error('Error fetching completed tasks:', error);
    res.status(500).json({ message: 'Server error' });
  }
  
};

export const getCompletedSummary = async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization || '';
    let tokenEmail: string | null = null;
    if (authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'default_secret');
        tokenEmail = decoded?.userEmail || null;
      } catch (e) {
        // invalid token
      }
    }
    const { userEmail } = req.query;
    if (!tokenEmail && !userEmail) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }
    if (userEmail && tokenEmail && String(userEmail) !== String(tokenEmail)) {
      res.status(403).json({ message: 'Forbidden' });
      return;
    }
    const filterEmail = tokenEmail || String(userEmail);
    const filter: any = {};
    if (filterEmail) filter.userEmail = filterEmail;
    const results = await CompletedTask.aggregate([
      { $match: filter },
      { $group: { _id: null, totalEarned: { $sum: { $ifNull: ["$rewardPoints", 0] } } } },
    ]);
    const totalEarned = results && results[0] ? results[0].totalEarned : 0;
    res.status(200).json({ totalEarned });
  } catch (err) {
    console.error('Error computing completed tasks summary', err);
    res.status(500).json({ message: 'Server error' });
  }
};


  