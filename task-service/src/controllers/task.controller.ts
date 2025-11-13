import { Request, Response } from "express";
import axios from "axios";
import Task from "../models/task.model";
import CompletedTask from "../models/completedTask.model";

export const createTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const { taskName, dueDate, priority, category, userEmail, description, isCompleted } = req.body;

    const task = new Task({
      taskName,
      dueDate,
      priority,
      category,
      userEmail,
      description,
      isCompleted
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
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};


export const getPendingTasks = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.params;
    if (status == "pending") {
        const pendingTasks = await Task.find({ status: "pending" }).sort({ createdAt: -1 });

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
    const tasks = await Task.findById(id).sort({ createdAt: -1 });
    res.json(tasks);
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
    
    const { id } = req.params;
    const { taskId, userEmail } = req.body;

    console.log("Marking task complete:", id, userEmail);

    if (!id || !userEmail) {
      res.status(400).json({ message: "taskId and userEmail are required" });
      return;
    }

    const task = await Task.findById(id);

    if (!task) {
      res.status(404).json({ message: "Task not found" });
      return;
    }

  
    const priority = (task.priority || "Low").toLowerCase();
    const pointsMap: Record<string, number> = { low: 10, medium: 30, high: 50 };
    const points = pointsMap[priority] ?? 10;

    // Create a completed task record
    const completed = new CompletedTask({
      userEmail: task.userEmail,
      taskName: task.taskName,
      dueDate: task.dueDate,
      category: task.category,
      priority: task.priority,
      description: task.description,
      isCompleted: true,
      rewardPoints: points,
      completedAt: new Date(),
    });

    await completed.save();
    await Task.findByIdAndDelete(id);

    const userServiceUrl = process.env.USER_SERVICE_URL || "http://localhost:4000/api/users/rewards/add";

    try {
      await axios.post(userServiceUrl, { userEmail, points });
    } catch (err) {
      console.error("Failed to call User Service to add reward:", err);
    }

    res.status(200).json({ message: "Task completed and moved to completed tasks", points });
  } catch (error) {
    console.error("Error completing task:", error);
    res.status(500).json({ message: "Server error" });
  }
};