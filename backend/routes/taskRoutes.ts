import express from "express";
import { TaskController } from "../controllers/taskController";

const router = express.Router();
const taskController = new TaskController();

router.post("/", taskController.createTaskAsync);
router.get("/", taskController.getTasksAsync);
router.put("/order", taskController.updateTaskOrderAsync);
router.put("/:id", taskController.updateTaskAsync);
router.patch("/:id", taskController.restoreTaskAsync);
router.delete("/:ids", taskController.deleteTaskAsync);

export default router;
