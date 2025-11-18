// src/routes/user.routes.ts
import { Router } from "express";
import {
  createUser,
  getAllUsers,
  getUserbyId,
  updateUser,
  deleteUser,
  completeTaskAndAddReward,
  addReward,
  googleAuthRedirect,
  googleAuthCallback,
} from "../controllers/user.controller";

const router = Router();

// Google auth routes
router.get("/auth/google", googleAuthRedirect);
router.get("/auth/google/callback", googleAuthCallback);

// User CRUD
router.post("/", createUser);
router.get("/", getAllUsers);
router.get("/:id", getUserbyId);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

router.post("/complete", completeTaskAndAddReward);
router.post("/rewards/add", addReward);

export default router;
