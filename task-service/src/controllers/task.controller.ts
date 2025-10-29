import { Request, Response } from "express";
import Task from "../models/task.model";

export const createTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const { taskName, dueDate, priority, category, userEmail } = req.body;

    const task = new Task({
      taskName,
      dueDate,
      priority,
      category,
      userEmail
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
