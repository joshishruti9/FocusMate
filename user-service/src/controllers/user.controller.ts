import { Request, Response } from "express";
import User from "../models/user.model";

export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, firstName, lastName, password, rewardPoints } = req.body;

    const user = new User({
      username,
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
