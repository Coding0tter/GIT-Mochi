import { handleControllerError } from "@server/errors/mochi.error.ts";
import { SettingService } from "@server/services/setting.service.v2.ts";
import type { NextFunction, Request, Response } from "express";

export class SettingController {
  private _service: SettingService;

  constructor() {
    this._service = new SettingService();
  }

  getSettingByKey = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json(await this._service.getSettingByKey(req.params.key));
    } catch (error) {
      handleControllerError(error, next);
    }
  };

  setSettingByKey = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this._service.setSettingByKey(req.params.key, req.body.value);
      res.status(204).send();
    } catch (error) {
      handleControllerError(error, next);
    }
  };

  getUserSettingByKey = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      res.json(
        await this._service.getUserSettingByKey(req.user.id, req.params.key),
      );
    } catch (error) {
      handleControllerError(error, next);
    }
  };

  setUserSettingByKey = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      await this._service.setUserSettingByKey(
        req.user.id,
        req.params.key,
        req.body.value,
      );
      res.status(204).send();
    } catch (error) {
      handleControllerError(error, next);
    }
  };
}
