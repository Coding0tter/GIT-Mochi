import { LabelController } from "@server/controllers/label.controller.ts";
import express from "express";

const router = express.Router();
const controller = new LabelController();

router.get("/gitlab", controller.searchGitlabLabels);

export default router;
