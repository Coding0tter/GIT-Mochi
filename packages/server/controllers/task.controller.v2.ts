import {
  handleControllerError,
  MochiError,
} from "@server/errors/mochi.error.ts";
import { TaskServiceV2 } from "@server/services/task.service.v2.ts";
import type { NextFunction, Request, Response } from "express";

export class TaskControllerV2 {
  private _service: TaskServiceV2;

  constructor() {
    this._service = new TaskServiceV2();
  }

  getIssues = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const issues = await this._service.getTasksForUser(req.user.gitlabId);

      res.json(issues);
    } catch (err) {
      handleControllerError(err, next);
    }
  };

  markAsRead = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (isNaN(Number(req.params.id))) {
        throw new MochiError("Invalid task ID", 400);
      }
      await this._service.markAsRead(Number(req.params.id));

      res.json({ taskId: req.params.id });
    } catch (err) {
      handleControllerError(err, next);
    }
  };

  updateStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (isNaN(Number(req.params.id))) {
        throw new MochiError("Invalid task ID", 400);
      }

      await this._service.updateStatus(
        req.user.id,
        Number(req.params.id),
        req.body.status,
      );

      res.json({ taskId: req.params.id, status: req.body.status });
    } catch (err) {
      handleControllerError(err, next);
    }
  };
}
