import express from "express";
import User from "../models/User";

const router = express.Router();

router.get("/:userId", async (req, res) => {
  const user = await User.findById(req.params.userId);
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
});

export default router;
