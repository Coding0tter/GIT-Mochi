import express from "express";
import {
  createMergeRequest,
  getUser,
  getProjects,
  GitlabController,
} from "../controllers/gitlabController";

const router = express.Router();
const gitlabController = new GitlabController();

router.post("/sync", gitlabController.syncGitLabAsync);
router.post("/create-merge-request", createMergeRequest);
router.get("/user", getUser);
router.get("/projects", getProjects);

export default router;
