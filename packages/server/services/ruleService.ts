import { MochiError } from "../errors/mochiError";
import type { IRule } from "../models/rule";
import { RuleRepo } from "../repositories/ruleRepo";
import { BaseService } from "./baseService";

export class RuleService extends BaseService<IRule> {
  constructor() {
    super(new RuleRepo(), "Rule");
  }

  async createRuleAsync(rule: IRule) {
    try {
      return super.createAsync(rule);
    } catch (error: any) {
      throw new MochiError("Error creating rule", 500, error);
    }
  }

  async deleteRuleAsync(id: string) {
    try {
      return super.deleteAsync(id);
    } catch (error: any) {
      throw new MochiError("Error deleting rule", 500, error);
    }
  }

  async toggleRuleAsync(id: string) {
    try {
      const rule = await super.getByIdAsync(id);

      if (!rule) {
        throw new Error("Rule not found");
      }

      rule.enabled = !rule.enabled;

      return super.updateAsync(id, rule);
    } catch (error: any) {
      throw new MochiError("Error toggling rule", 500, error);
    }
  }
}
