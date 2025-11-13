import { handleControllerError } from "@server/errors/mochi.error.ts";
import { GitlabServiceV2 } from "@server/services/gitlab.service.v2.ts";
import type { NextFunction, Request, Response } from "express";

export class DiscussionController {
  private _service: GitlabServiceV2;

  constructor() {
    this._service = new GitlabServiceV2();
  }

  getDiscussions = async (
    req: Request<{}, {}, {}, { issueIid: number; mergeRequestIids?: number[] }>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const discussions = await this._service.fetchDiscussions(
        req.query.issueIid,
        req.query.mergeRequestIids,
      );

      res.json(discussions);
    } catch (err) {
      handleControllerError(err, next);
    }
  };
}
