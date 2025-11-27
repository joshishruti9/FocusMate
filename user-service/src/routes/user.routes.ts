import { Router } from "express";
import {
	createUser,
	getAllUsers,
	getUserbyId,
	updateUser,
	deleteUser,
	completeTaskAndAddReward,
	addReward,
	getUserByEmail,
	updateNotificationPreference,
} from "../controllers/user.controller";

const router = Router();

router.post("/", createUser);
router.get("/", getAllUsers);
//router.get("/getUserEmail", getUserbyEmail);

router.get("/:id", getUserbyId);
router.get('/email/:email', getUserByEmail);

// Update user
router.put("/:id", updateUser);
router.put('/:id/notification', updateNotificationPreference);

// Delete user
router.delete("/:id", deleteUser);

router.post("/complete", completeTaskAndAddReward);

router.post("/rewards", addReward);


export default router;
