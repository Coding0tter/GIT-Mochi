import express from "express";
import { GitlabController } from "../controllers/gitlab.controller";

const router = express.Router();
const gitlabController = new GitlabController();

router.post("/sync", gitlabController.syncGitLabAsync);
router.post("/create-merge-request", gitlabController.createMergeRequestAsync);
router.post("/assign", gitlabController.assignToUserAsync);
router.post("/comment", gitlabController.commentOnTaskAsync);
router.post("/resolve", gitlabController.resolveThreadAsync);
router.post("/toggle-draft", gitlabController.toggleDraft);
router.post("/mark_as_done", gitlabController.markTodoAsDone);
router.get("/user", gitlabController.getUserAsync);
router.get("/users", gitlabController.getUsersAsync);
router.get("/projects", gitlabController.getProjectsAsync);
router.get("/todos", gitlabController.getTodosAsync);

export default router;
