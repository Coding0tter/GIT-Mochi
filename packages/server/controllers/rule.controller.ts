import type { Request, Response, NextFunction } from "express";
import { EventRegistry } from "../events/eventRegistry";
import { RuleService } from "../services/rule.service";
import { handleControllerError } from "../errors/mochi.error";

export class RuleController {
  private ruleService: RuleService;

  constructor() {
    this.ruleService = new RuleService();
  }

  getEmittersAsync = async (
    req: Request,
    res: Response,
    next: NextFunction,
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
    next: NextFunction,
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

  getAllRulesAsync = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const rules = await this.ruleService.getAllAsync();
      res.json(rules);
    } catch (error) {
      handleControllerError(error, next);
    }
  };

  deleteRuleAsync = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.ruleService.deleteRuleAsync(req.params.id);
      res.sendStatus(204);
    } catch (error) {
      handleControllerError(error, next);
    }
  };

  toggleRuleAsync = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const rule = await this.ruleService.toggleRuleAsync(req.params.id);
      res.json(rule);
    } catch (error) {
      handleControllerError(error, next);
    }
  };
}
