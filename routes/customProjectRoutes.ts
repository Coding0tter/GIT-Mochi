import express from "express";
import {
  createProjectAsync,
  deleteProjectAsync,
  getProjectAsync,
  getProjectsAsync,
  setCurrentProjectAsync,
  updateProjectAsync,
} from "../controllers/customProjectController";

const router = express.Router();

router.get("/projects", getProjectsAsync);
router.get("/project/:id", getProjectAsync);
router.post("/project", createProjectAsync);
router.put("/project/:id", updateProjectAsync);
router.delete("/project/:id", deleteProjectAsync);

router.patch("/project/:id", setCurrentProjectAsync);

export default router;
