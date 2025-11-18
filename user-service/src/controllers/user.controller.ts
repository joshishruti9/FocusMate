// src/controllers/user-controller.ts
import { Request, Response } from "express";
import User from "../models/user.model";
import axios from "axios";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import crypto from "crypto";

// ---------- ENV + GOOGLE CLIENT ----------
const {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI,
  JWT_SECRET,
  FRONTEND_URL,
} = process.env as {
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  GOOGLE_REDIRECT_URI: string;
  JWT_SECRET: string;
  FRONTEND_URL?: string;
};

const googleClient = GOOGLE_CLIENT_ID
  ? new OAuth2Client(GOOGLE_CLIENT_ID)
  : null;

// simple in-memory state store for CSRF
const stateStore = new Set<string>();
const createState = () => {
  const s = crypto.randomBytes(16).toString("hex");
  stateStore.add(s);
  return s;
};
const consumeState = (s: string) => {
  const exists = stateStore.has(s);
  if (exists) stateStore.delete(s);
  return exists;
};

// ---------- JWT helper ----------
function createAppJwt(user: any) {
  return jwt.sign(
    {
      userId: user._id.toString(),
      email: user.userEmail,
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

// ---------- EXISTING CONTROLLERS ----------

export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userEmail, firstName, lastName, password } = req.body;

    if (!userEmail || !firstName || !lastName || !password) {
      res.status(400).json({ message: "userEmail, firstName, lastName, password are required" });
      return;
    }

    const existing = await User.findOne({ userEmail });
    if (existing) {
      res.status(409).json({ message: "User with this email already exists" });
      return;
    }

    const user = new User({
      userEmail,
      firstName,
      lastName,
      password,     // TODO: hash in real life
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
    const user = await User.findById(id); // findById already returns a single doc
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.json(user);
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

    if (!userEmail || typeof points !== "number") {
      res.status(400).json({ message: "userEmail and numeric points are required" });
      return;
    }

    const user = await User.findOne({ userEmail });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    user.rewardPoints = (user.rewardPoints || 0) + points;
    await user.save();

    res.status(200).json({ message: "Reward added", user });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ---------- GOOGLE AUTH CONTROLLERS ----------

// Step 1: redirect to Google
export const googleAuthRedirect = (req: Request, res: Response): void => {
  if (!googleClient) {
    res.status(500).json({ message: "Google client not configured" });
    return;
  }

  const state = createState();

  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: GOOGLE_REDIRECT_URI,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "consent",
    state,
  });

  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  res.redirect(googleAuthUrl);
};

// Step 2: Google callback
export const googleAuthCallback = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code, state } = req.query;

    if (!code || typeof code !== "string") {
      res.status(400).json({ message: "Missing authorization code" });
      return;
    }

    if (!state || typeof state !== "string" || !consumeState(state)) {
      res.status(400).json({ message: "Invalid state" });
      return;
    }

    // Exchange code for tokens
    const tokenResponse = await axios.post(
      "https://oauth2.googleapis.com/token",
      new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: GOOGLE_REDIRECT_URI,
        grant_type: "authorization_code",
      }),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );

    const { id_token } = tokenResponse.data;

    if (!id_token || !googleClient) {
      res.status(400).json({ message: "No id_token returned by Google" });
      return;
    }

    // Verify ID token
    const ticket = await googleClient.verifyIdToken({
      idToken: id_token,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.sub || !payload.email) {
      res.status(400).json({ message: "Invalid Google token payload" });
      return;
    }

    const googleSub = payload.sub;
    const email = payload.email;
    const emailVerified = payload.email_verified ?? false;
    const givenName = payload.given_name || payload.name?.split(" ")[0] || "User";
    const familyName = payload.family_name || payload.name?.split(" ").slice(1).join(" ") || "";
    const picture = payload.picture || undefined;

    // Upsert user
    let user = await User.findOne({ googleSub });

    if (!user) {
      // Try linking by email if user signed up with email/password
      user = await User.findOne({ userEmail: email });

      if (user) {
        user.googleSub = googleSub;
        if (picture) user.avatarUrl = picture;
        if (!user.firstName) user.firstName = givenName;
        if (!user.lastName) user.lastName = familyName;
        await user.save();
      } else {
        // Create a new Google-only user
        let user: any | null = await User.findOne({ googleSub });

if (!user) {
  // Try linking by email if user signed up with email/password
  user = await User.findOne({ userEmail: email });

  if (user) {
    user.googleSub = googleSub;
    if (picture) user.avatarUrl = picture;
    if (!user.firstName) user.firstName = givenName;
    if (!user.lastName) user.lastName = familyName;
    await user.save();
  } else {
    // Create a new Google-only user
    user = new User({
      userEmail: email,
      firstName: givenName,
      lastName: familyName || ".",
      googleSub,
      avatarUrl: picture,
      // no password; allowed by schema (password not required)
    });
    await user.save();
  }
}
        await user.save();
      }
    }

    if (!emailVerified) {
      // You can choose to block or allow unverified emails; for now allow
      console.warn("Google email not verified for user:", email);
    }

    const token = createAppJwt(user);

    // If you want cookies instead of JSON, you can set one here:
    // res.cookie("session", token, { httpOnly: true, secure: true, sameSite: "lax" });

    // For now just return JSON and optionally redirect
    if (FRONTEND_URL) {
      // Example: redirect with token in query (or better: short-lived code)
      res.redirect(`${FRONTEND_URL}/auth/google/callback?token=${token}`);
    } else {
      res.status(200).json({ token, user });
    }
  } catch (err) {
    console.error("Google auth error:", err);
    res.status(500).json({ message: "Google authentication failed" });
  }
};
