import express from "express";
import {
  syncGitLab,
  createMergeRequest,
  getUser,
  getProjects,
  setProject,
  getCurrentProject,
} from "../controllers/gitlabController";

const router = express.Router();

router.post("/sync", syncGitLab);
router.post("/create-merge-request", createMergeRequest);
router.get("/user", getUser);
router.get("/projects", getProjects);
router.patch("/project/:id", setProject);
router.get("/project", getCurrentProject);

export default router;
