import { ProjectControllerV2 } from "@server/controllers/project.controller.v2.ts";
import express from "express";

const router = express.Router();
const projectController = new ProjectControllerV2();

router.get("/", projectController.searchProjects);

export default router;
