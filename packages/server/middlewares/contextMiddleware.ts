import type { NextFunction, Request, Response } from "express";
import { ProjectService } from "../services/projectService";
import {
  asyncLocalStorage,
  ContextKeys,
  setContext,
} from "../utils/asyncContext";

export const contextMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  asyncLocalStorage.run(new Map(), async () => {
    try {
      const projectService = new ProjectService();
      const currentProject = await projectService.getCurrentProjectAsync();

      setContext(ContextKeys.Project, currentProject);
    } finally {
      next();
    }
  });
};
