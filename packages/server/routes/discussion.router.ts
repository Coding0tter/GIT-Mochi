import { DiscussionController } from "@server/controllers/discussion.controller.ts";
import express from "express";

const router = express.Router();
const controller = new DiscussionController();

router.get("/", controller.getDiscussions);

export default router;
