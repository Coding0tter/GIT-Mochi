import { handleControllerError } from "@server/errors/mochi.error.ts";
import { ProjectServiceV2 } from "@server/services/project.service.v2.ts";
import type { Request, Response, NextFunction } from "express";

export class ProjectControllerV2 {
  private _service: ProjectServiceV2;

  constructor() {
    this._service = new ProjectServiceV2();
  }

  searchProjects = async (
    req: Request<{}, {}, {}, { search: string }>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      res.json(await this._service.searchProjects(req.query.search));
    } catch (error) {
      handleControllerError(error, next);
    }
  };
}
