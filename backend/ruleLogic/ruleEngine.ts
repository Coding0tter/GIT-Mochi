import { EventEmitterService } from "../events/eventEmitterService";
import type { IAction, ICondition, IRule } from "../models/rule";
import { RuleService } from "../services/ruleService";

export class RuleEngine {
  private static instance: RuleEngine;
  private rules: IRule[] = [];

  private constructor() {}

  static getInstance() {
    if (!RuleEngine.instance) {
      RuleEngine.instance = new RuleEngine();
    }
    return RuleEngine.instance;
  }

  async loadRules() {
    const ruleService = new RuleService();
    this.rules = await ruleService.getAllAsync();
  }

  initialize() {
    const emitter = EventEmitterService.getEmitter();
    this.rules.forEach((rule) => {
      emitter.on(rule.eventType, async (data) => {
        await this.evaluateAndExecute(rule, data);
      });
    });
  }

  async addRule(ruleData: IRule) {
    this.rules.push(ruleData);

    const emitter = EventEmitterService.getEmitter();
    emitter.on(ruleData.eventType, async (data) => {
      await this.evaluateAndExecute(ruleData, data);
    });
  }

  private async evaluateAndExecute(rule: IRule, data: any) {
    const conditionsMet = rule.conditions
      ? rule.conditions.every((condition) =>
          this.evaluateCondition(condition, data)
        )
      : true;

    if (conditionsMet) {
      for (const action of rule.actions) {
        this.executeAction(action, data);
      }
    }
  }

  private evaluateCondition(condition: ICondition, data: any): boolean {
    const { fieldPath, operator, value } = condition;
    const fieldValue = this.getFieldValue(data, fieldPath);

    switch (operator) {
      case "==":
        return fieldValue === value;
      case "!=":
        return fieldValue !== value;
      case ">":
        return fieldValue > value;
      case "<":
        return fieldValue < value;
      default:
        return false;
    }
  }

  private executeAction(action: IAction, data: any) {
    this.setFieldValue(data, action.targetPath, action.value);
  }

  private getFieldValue(obj: any, path: string): any {
    return path.split(".").reduce((acc, part) => acc && acc[part], obj);
  }

  private setFieldValue(obj: any, path: string, value: any) {
    const parts = path.split(".");
    const lastPart = parts.pop()!;
    const target = parts.reduce((acc, part) => acc && acc[part], obj);

    if (target && lastPart) {
      target[lastPart] = value;
    }
  }
}
