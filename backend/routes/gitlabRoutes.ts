import express from "express";
import { GitlabController } from "../controllers/gitlabController";

const router = express.Router();
const gitlabController = new GitlabController();

router.post("/sync", gitlabController.syncGitLabAsync);
router.post("/create-merge-request", gitlabController.createMergeRequestAsync);
router.post("/assign", gitlabController.assignToUserAsync);
router.get("/user", gitlabController.getUserAsync);
router.get("/users", gitlabController.getUsersAsync);
router.get("/projects", gitlabController.getProjectsAsync);

export default router;
