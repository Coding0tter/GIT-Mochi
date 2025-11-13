import {
  handleControllerError,
  MochiError,
} from "@server/errors/mochi.error.ts";
import { GitlabServiceV2 } from "@server/services/gitlab.service.v2.ts";
import { TaskServiceV2 } from "@server/services/task.service.v2.ts";
import { GitlabSyncV2 } from "@server/syncs/gitlab.sync.v2.ts";
import type { NextFunction, Request, Response } from "express";

export class GitlabControllerV2 {
  private _taskService: TaskServiceV2;
  private _service: GitlabServiceV2;
  private _gitlabSync: GitlabSyncV2;

  constructor() {
    this._service = new GitlabServiceV2();
    this._taskService = new TaskServiceV2();
    this._gitlabSync = new GitlabSyncV2();
  }

  syncGitLabAsync = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      await this._gitlabSync.sync(true, req.user.gitlabId);
      res
        .status(200)
        .json({ message: "GitLab data and issues synced successfully" });
    } catch (error) {
      handleControllerError(error, next);
    }
  };

  createMergeRequest = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      if (isNaN(Number(req.params.id))) {
        throw new MochiError("Invalid task ID", 400);
      }

      const task = await this._taskService.getTaskById(Number(req.params.id));

      if (!task) {
        throw new MochiError("Task not found", 404);
      }

      await this._service.createMergeRequest(
        task,
        req.user.gitlabId,
        req.body.branchName,
      );

      res.status(200).json({ message: "Merge request created successfully" });
    } catch (err) {
      handleControllerError(err, next);
    }
  };

  getPipelineDetails = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      if (isNaN(Number(req.params.mrIid))) {
        throw new MochiError("Invalid merge request IID", 400);
      }

      return await this._service.getPipelineDetails(Number(req.params.mrIid));
    } catch (err) {
      handleControllerError(err, next);
    }
  };

  setReviewers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (isNaN(Number(req.params.id))) {
        throw new MochiError("Invalid task ID", 400);
      }

      await this._service.setReviewers(Number(req.params.id), req.body.userIds);

      res.status(200).json({ message: "Reviewers set successfully" });
    } catch (err) {
      handleControllerError(err, next);
    }
  };
}
