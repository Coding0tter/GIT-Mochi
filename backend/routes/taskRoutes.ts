import express from "express";
import { TaskController } from "../controllers/taskController";

const router = express.Router();
const taskController = new TaskController();

router.post("/", taskController.createTaskAsync);
router.get("/", taskController.getTasksAsync);
router.put("/:id", taskController.updateTaskAsync);
router.patch("/:id", taskController.restoreTaskAsync);
router.delete("/:id", taskController.deleteTaskAsync);

export default router;
