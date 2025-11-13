import { TaskControllerV2 } from "@server/controllers/task.controller.v2.ts";
import express from "express";

const router = express.Router();
const taskController = new TaskControllerV2();

router.get("/", taskController.getIssues);
router.patch("/:id/status", taskController.updateStatus);
router.patch("/:id/read", taskController.markAsRead);

export default router;
