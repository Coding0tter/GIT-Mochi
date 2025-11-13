import { TodoController } from "@server/controllers/todo.controller.ts";
import express from "express";

const router = express.Router();
const controller = new TodoController();

router.get("/", controller.getTodos);
router.put("/done", controller.markDone);

export default router;
