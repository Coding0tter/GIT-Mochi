import type { NextFunction, Request, Response } from "express";
import { GitlabService } from "../services/gitlab.service";
import { handleControllerError } from "../errors/mochi.error";
import { GitlabSync } from "@server/syncs/gitlab.sync";

export class GitlabController {
  private gitlabService = new GitlabService();
  private gitlabSync = new GitlabSync();

  syncGitLabAsync = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      await this.gitlabSync.sync(true);
      res
        .status(200)
        .json({ message: "GitLab data and issues synced successfully" });
    } catch (error) {
      handleControllerError(error, next);
    }
  };

  markTodoAsDone = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id } = req.body;
      const result = await this.gitlabService.markTodoAsDone(id);
      res.status(200).json(result);
    } catch (error) {
      handleControllerError(error, next);
    }
  };

  toggleDraft = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { taskId } = req.body;
      const result = await this.gitlabService.toggleDraft(taskId);
      res.status(200).json(result);
    } catch (error) {
      handleControllerError(error, next);
    }
  };

  assignToUserAsync = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { taskId, userId } = req.body;
      const result = await this.gitlabService.assignToUserAsync(taskId, userId);
      res.status(200).json(result);
    } catch (error) {
      handleControllerError(error, next);
    }
  };

  createMergeRequestAsync = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { issueId } = req.body;
      const result =
        await this.gitlabService.createGitlabMergeRequestAsync(issueId);
      res.status(200).json(result);
    } catch (error) {
      handleControllerError(error, next);
    }
  };

  resolveThreadAsync = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { task, discussion } = req.body;
      const result = await this.gitlabService.resolveThreadAsync(
        task,
        discussion,
      );
      res.status(200).json(result);
    } catch (error) {
      handleControllerError(error, next);
    }
  };

  commentOnTaskAsync = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { task, discussion, reply } = req.body;
      const result = await this.gitlabService.commentOnTaskAsync(
        task,
        discussion,
        reply,
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

  getTodosAsync = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const todos = await this.gitlabService.getTodosAsync();
      res.status(200).json(todos);
    } catch (error) {
      handleControllerError(error, next);
    }
  };

  getUsersAsync = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const users = await this.gitlabService.getUsersAsync();
      res.status(200).json(users);
    } catch (error) {
      handleControllerError(error, next);
    }
  };

  getProjectsAsync = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const projects = await this.gitlabService.getProjectsAsync();
      res.status(200).json(projects);
    } catch (error) {
      handleControllerError(error, next);
    }
  };
}
