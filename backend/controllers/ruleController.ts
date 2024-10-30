import type { Request, Response, NextFunction } from "express";
import { EventRegistry } from "../events/eventRegistry";
import { RuleService } from "../services/ruleService";
import { handleControllerError } from "../errors/mochiError";

export class RuleController {
  private ruleService: RuleService;

  constructor() {
    this.ruleService = new RuleService();
  }

  getEmittersAsync = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      res.json(EventRegistry.getInstance().getEmitters());
    } catch (error) {
      next(error);
    }
  };

  getListenersAsync = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      res.json(EventRegistry.getInstance().getListeners());
    } catch (error) {
      next(error);
    }
  };

  createRuleAsync = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const newRule = await this.ruleService.createRuleAsync(req.body);
      res.status(201).send(newRule);
    } catch (error) {
      handleControllerError(error, next);
    }
  };
}
