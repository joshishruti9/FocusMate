import { Request, Response } from "express";
import User from "../models/user.model";
import axios from "axios";
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import router from "../routes/user.routes";
const passport = require('passport');
import crypto from 'crypto';

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
    const { id } = req.params;
    const users = await User.findById(id).sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getUserByEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.params;
    const user = await User.findOne({ userEmail: email });
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.status(200).json(user);
  } catch (err) {
    console.error('Error fetching user by email:', err);
    res.status(500).json({ message: 'Server error' });
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

export const updateNotificationPreference = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { notificationPreference } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: { notificationPreference } },
      { new: true, runValidators: true }
    );
    if (!updatedUser) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.status(200).json(updatedUser);
  } catch (err) {
    console.error('Error updating notification preference:', err);
    res.status(500).json({ message: 'Server error' });
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
    console.log('Adding reward points:', userEmail, points);
    if (!userEmail || typeof points !== 'number') {
      res.status(400).json({ message: 'userEmail and numeric points are required' });
      return;
    }
    const user = await User.findOne({ userEmail });
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    user.rewardPoints = (user.rewardPoints || 0) + points;
    await user.save();
     res.status(200).json({message: "Reward points added successfully",rewardPoints: user.rewardPoints});

  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Google OAuth login using ID token verification
export const googleLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      res.status(400).json({ message: 'idToken required' });
      return;
    }

    // Verify token using google-auth-library
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || '109401400332-e8j188na64feh8p1pf42vr68inpo644v.apps.googleusercontent.com');
    const ticket = await client.verifyIdToken({ idToken, audience: process.env.GOOGLE_CLIENT_ID || '109401400332-e8j188na64feh8p1pf42vr68inpo644v.apps.googleusercontent.com' }).catch(err => null);
    if (!ticket) {
      res.status(401).json({ message: 'Invalid idToken' });
      return;
    }
    const payload = ticket.getPayload();
    const email = payload?.email as string;
    const firstName = payload?.given_name || payload?.name || 'User';
    const lastName = payload?.family_name || '';
    const picture = payload?.picture || '';

    // Find or create the user in our DB
    let user = await User.findOne({ userEmail: email });
    if (!user) {
      // create a random password; user authenticates via oauth
      const randomPassword = crypto.randomBytes(16).toString('hex');
      user = new User({ userEmail: email, firstName, lastName, password: randomPassword, picture });
      await user.save();
    }
    else if (picture && user.picture !== picture) {
      // update user's picture if it changed
      user.picture = picture;
      await user.save();
    }

    // Fetch user's tasks from task-service (active tasks)
    const taskServiceUrl = process.env.TASK_SERVICE_URL || 'http://localhost:5000';
    const tasksResp = await axios.get(`${taskServiceUrl}/api/tasks?userEmail=${encodeURIComponent(email)}`).catch(err => null);
    const tasks = tasksResp && tasksResp.data ? tasksResp.data : [];
    // Fetch total earned from completed tasks and sync to user's rewardPoints if not set
    const summaryResp = await axios.get(`${taskServiceUrl}/api/tasks/completed/summary?userEmail=${encodeURIComponent(email)}`).catch(err => null);
    const totalEarned = summaryResp && summaryResp.data ? summaryResp.data.totalEarned : 0;
    // When creating new users, or if the user currently has 0 rewardPoints, set rewardPoints to totalEarned
    if (!user.rewardPoints || user.rewardPoints === 0) {
      user.rewardPoints = totalEarned;
      await user.save();
    }

    // Issue a JWT for the user
    const token = jwt.sign({ userEmail: user.userEmail, id: user._id }, process.env.JWT_SECRET || 'default_secret', { expiresIn: '1h' });

    // Respond with user, token and their tasks
    res.status(200).json({ user, token, tasks });
    return;
  } catch (err) {
    console.error('Google login failed:', err);
    res.redirect('http://localhost:4200/login');
    return;
  }
};

export const purchaseItemForUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params; // user id
    const { itemId, price, name, imageUrl } = req.body;

    const user = await User.findById(id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    if (typeof price !== 'number' || price < 0) {
      res.status(400).json({ message: 'Invalid price' });
      return;
    }

    if ((user.rewardPoints || 0) < price) {
      res.status(400).json({ message: 'Insufficient reward points' });
      return;
    }

    user.rewardPoints = (user.rewardPoints || 0) - price;
    user.purchasedItems = user.purchasedItems || [];
    user.purchasedItems.push({ itemId, name, price, imageUrl, purchasedAt: new Date() } as any);
    await user.save();

    res.status(200).json({ message: 'Purchase recorded', user });
  } catch (err) {
    console.error('Error in purchaseItemForUser:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};