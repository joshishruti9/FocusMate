import express from "express";
import User from "../models/User";

const router = express.Router();

// Called by task-service when a user completes a task
router.post("/add", async (req, res) => {
  const { userId, xp, coins } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.xp += xp;
    user.coins += coins;
    await user.save();

    res.json({ message: "Rewards added successfully", user });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : err });
  }
});

export default router;