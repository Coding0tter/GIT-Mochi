import express from "express";
import {
  createTask,
  getTasks,
  updateTask,
  restoreTask,
  deleteTask,
} from "../controllers/taskController";

const router = express.Router();

router.post("/", createTask);
router.get("/", getTasks);
router.put("/:id", updateTask);
router.put("/:id/restore", restoreTask);
router.delete("/:id", deleteTask);

export default router;
