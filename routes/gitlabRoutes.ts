import express from "express";
import {
  syncGitLab,
  createMergeRequest,
  getUser,
  getProjects,
} from "../controllers/gitlabController";

const router = express.Router();

router.post("/sync", syncGitLab);
router.post("/create-merge-request", createMergeRequest);
router.get("/user", getUser);
router.get("/projects", getProjects);

export default router;
