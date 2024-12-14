import type { NextFunction, Request, Response } from "express";
import { ProjectService } from "../services/projectService";
import { handleControllerError } from "../errors/mochiError";

export class ProjectController {
  private projectService: ProjectService;

  constructor() {
    this.projectService = new ProjectService();
  }

  createProjectAsync = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { name } = req.body;
      const project = await this.projectService.createProjectAsync(name);
      res.status(200).json(project);
    } catch (error) {
      handleControllerError(error, next);
    }
  };

  updateProjectAsync = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const { name } = req.body;
      const project = await this.projectService.updateProjectAsync(id, name);
      res.status(200).json(project);
    } catch (error) {
      handleControllerError(error, next);
    }
  };

  deleteProjectAsync = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      await this.projectService.deleteProjectAsync(id);
      res.status(200).json(id);
    } catch (error) {
      handleControllerError(error, next);
    }
  };

  getProjectsAsync = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const projects = await this.projectService.getProjectsAsync();
      res.status(200).json(projects);
    } catch (error) {
      handleControllerError(error, next);
    }
  };

  getProjectByIdAsync = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const project = await this.projectService.getProjectByIdAsync(id);
      res.status(200).json(project);
    } catch (error) {
      handleControllerError(error, next);
    }
  };

  setCurrentProjectAsync = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { projectId } = req.body;
      const project = await this.projectService.setCurrentProjectAsync(
        projectId
      );
      res.status(200).json(project);
    } catch (error) {
      handleControllerError(error, next);
    }
  };

  getCurrentProjectAsync = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const project = await this.projectService.getCurrentProjectAsync();
      res.status(200).json(project);
    } catch (error) {
      handleControllerError(error, next);
    }
  };
}
