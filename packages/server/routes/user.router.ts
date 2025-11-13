import { UserController } from "@server/controllers/user.controller.ts";
import express from "express";

const router = express.Router();
const userController = new UserController();

router.get("/", userController.searchUsers);

export default router;
