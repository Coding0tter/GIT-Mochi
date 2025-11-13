import { handleControllerError } from "@server/errors/mochi.error.ts";
import { UserServiceV2 } from "@server/services/user.service.v2.ts";
import type { Request, Response, NextFunction } from "express";

export class UserController {
  private _service: UserServiceV2;

  constructor() {
    this._service = new UserServiceV2();
  }

  searchUsers = async (
    req: Request<{}, {}, {}, { search: string }>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      res.json(await this._service.searchUsers(req.query.search));
    } catch (error) {
      handleControllerError(error, next);
    }
  };
}
