import type { Request, Response, NextFunction } from "express";
import { EventRegistry } from "../events/eventRegistry";

export class RuleController {
  getEmitters = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json(EventRegistry.getInstance().getEmitters());
    } catch (error) {
      next(error);
    }
  };

  getListeners = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json(EventRegistry.getInstance().getListeners());
    } catch (error) {
      next(error);
    }
  };
}
