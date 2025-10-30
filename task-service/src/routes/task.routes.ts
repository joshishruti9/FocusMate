import { Router } from "express";
import { createTask, getAllTasks, getTaskbyId, getPendingTasks, updateTask, deleteTask} from "../controllers/task.controller";

const router = Router();

router.post("/", createTask);
router.get("/", getAllTasks);
router.get("/pending", getPendingTasks);
router.get("/:id", getTaskbyId);

// Update task
router.put("/:id", updateTask);

// Delete task
router.delete("/:id", deleteTask);


export default router;
