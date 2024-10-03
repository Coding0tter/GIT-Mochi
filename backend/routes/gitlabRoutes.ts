import express from "express";
import { GitlabController } from "../controllers/gitlabController";

const router = express.Router();
const gitlabController = new GitlabController();

router.post("/sync", gitlabController.syncGitLabAsync);
router.post("/create-merge-request", gitlabController.createMergeRequestAsync);
router.get("/user", gitlabController.getUserAsync);
router.get("/projects", gitlabController.getProjectsAsync);

export default router;
