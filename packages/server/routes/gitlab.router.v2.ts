import { GitlabControllerV2 } from "@server/controllers/gitlab.controller.v2.ts";
import express from "express";

const router = express.Router();
const gitlabController = new GitlabControllerV2();

router.post("/reviewers/:id", gitlabController.setReviewers);
router.get("/pipeline/:mrIid", gitlabController.getPipelineDetails);
router.post("/sync", gitlabController.syncGitLabAsync);
router.post("/:id", gitlabController.createMergeRequest);

export default router;
