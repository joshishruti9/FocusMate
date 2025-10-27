import { Router } from "express";
import { createTask, getAllTasks } from "../controllers/task.controller";

const router = Router();

router.post("/", createTask);
router.get("/", getAllTasks);

export default router;
