import { Request, Response } from "express";
import User from "../models/user.model";
import axios from "axios";

export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userEmail, firstName, lastName, password, rewardPoints } = req.body;

    const user = new User({
      userEmail,
      firstName,
      lastName,
      password,
      rewardPoints
    });

    await user.save();
    res.status(201).json({ message: "user created successfully", user });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};


export const getUserbyId = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log("Fetching user by ID:", req.params);
    const { id } = req.params;
    const users = await User.findById(id).sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};


export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedUser = await User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({ message: "User deleted successfully", user: deletedUser });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const completeTaskAndAddReward = async (req: Request, res: Response): Promise<void> => {
  try {
    const { taskId, userEmail } = req.body;
    
    const taskServiceUrl = "http://localhost:5000/tasks/complete";
    const taskResponse = await axios.post(taskServiceUrl, { taskId, userEmail });

    if (taskResponse.status !== 200) {
      res.status(400).json({ message: "Failed to complete task" });
      return;
    }

    res.status(200).json(taskResponse.data);

  } catch (err) {
    console.error("Error in completeTaskAndAddReward:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};


export const addReward = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userEmail, points } = req.body;

    if (!userEmail || typeof points !== 'number') {
      res.status(400).json({ message: 'userEmail and numeric points are required' });
      return;
    }

    const user = await User.findOne({ userEmail: userEmail });
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    user.rewardPoints = (user.rewardPoints || 0) + points;
    await user.save();

  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

