// ruleService.ts

import type { IRule } from "../models/rule";
import { RuleRepo } from "../repositories/ruleRepo";
import { BaseService } from "./baseService";

export class RuleService extends BaseService<IRule> {
  constructor() {
    super(new RuleRepo(), "Rule");
  }

  async createRuleAsync(rule: IRule) {
    return super.createAsync(rule);
  }
}
