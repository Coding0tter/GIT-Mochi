import express from "express";
import {
  createProjectAsync,
  deleteProjectAsync,
  getCurrentProjectAsync,
  getProjectAsync,
  getProjectsAsync,
  setCurrentProjectAsync,
  updateProjectAsync,
} from "../controllers/customProjectController";

const router = express.Router();

router.get("/", getProjectsAsync);
router.get("/current", getCurrentProjectAsync);
router.get("/:id", getProjectAsync);
router.post("/", createProjectAsync);
router.put("/:id", updateProjectAsync);
router.delete("/:id", deleteProjectAsync);
router.patch("/", setCurrentProjectAsync);

export default router;
