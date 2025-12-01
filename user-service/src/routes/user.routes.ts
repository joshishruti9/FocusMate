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
	googleLogin,
    purchaseItemForUser,
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

// Record a purchase (shop will post here when user buys an item)
router.post('/:id/purchase', purchaseItemForUser);

// Delete user
router.delete("/:id", deleteUser);

router.post("/complete", completeTaskAndAddReward);

router.post("/rewards", addReward);

router.post('/auth/google', googleLogin);

export default router;
