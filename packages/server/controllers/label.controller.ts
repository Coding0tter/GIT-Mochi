import { handleControllerError } from "@server/errors/mochi.error.ts";
import { LabelService } from "@server/services/label.service.ts";
import type { Request, Response, NextFunction } from "express";

export class LabelController {
  private _service: LabelService;

  constructor() {
    this._service = new LabelService();
  }

  searchGitlabLabels = async (
    req: Request<{}, {}, {}, { search: string; projectId: number }>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      res.json(
        await this._service.searchGitlab(req.query.search, req.query.projectId),
      );
    } catch (error) {
      handleControllerError(error, next);
    }
  };
}
