import { Router } from "express";
import { createUser, getAllUsers, getUserbyId, updateUser, deleteUser, completeTaskAndAddReward, addReward } from "../controllers/user.controller";

const router = Router();

router.post("/", createUser);
router.get("/", getAllUsers);
router.get("/:id", getUserbyId);

// Update user
router.put("/:id", updateUser);

// Delete user
router.delete("/:id", deleteUser);

router.post("/complete", completeTaskAndAddReward);

router.post("/rewards/add", addReward);


export default router;
