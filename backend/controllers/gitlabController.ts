import type { NextFunction, Request, Response } from "express";
import { GitlabService } from "../services/gitlabService";
import { handleControllerError } from "../utils/error";

export class GitlabController {
  private gitlabService: GitlabService;

  constructor() {
    this.gitlabService = new GitlabService();
  }

  syncGitLabAsync = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      await this.gitlabService.syncGitLabDataAsync();
      res
        .status(200)
        .json({ message: "GitLab data and issues synced successfully" });
    } catch (error) {
      handleControllerError(error, next);
    }
  };

  createMergeRequestAsync = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { issueId } = req.body;
      const result = await this.gitlabService.createGitlabMergeRequestAsync(
        issueId
      );
      res.status(200).json(result);
    } catch (error) {
      handleControllerError(error, next);
    }
  };

  getUserAsync = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await this.gitlabService.getUserByAccessTokenAsync();
      res.status(200).json(user);
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
      const projects = await this.gitlabService.getProjectsAsync();
      res.status(200).json(projects);
    } catch (error) {
      handleControllerError(error, next);
    }
  };
}
