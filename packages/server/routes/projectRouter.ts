import express from "express";
import { ProjectController } from "../controllers/projectController";

const router = express.Router();
const projectController = new ProjectController();

router.get("/", projectController.getProjectsAsync);
router.get("/current", projectController.getCurrentProjectAsync);
router.get("/:id", projectController.getProjectByIdAsync);
router.post("/", projectController.createProjectAsync);
router.put("/:id", projectController.updateProjectAsync);
router.delete("/:id", projectController.deleteProjectAsync);
router.patch("/", projectController.setCurrentProjectAsync);

export default router;
