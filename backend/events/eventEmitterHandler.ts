import EventEmitter2 from "eventemitter2";
import { RuleService } from "../services/ruleService";
import type { IAction, ICondition } from "../models/rule";
import { logError } from "../utils/logger";
import { MochiError } from "../errors/mochiError";
import { EventRegistry } from "./eventRegistry";
import type { MochiResult } from "../utils/mochiResult";
import path from "path";
import { findClassFile } from "../utils/findFile";

export class EventEmitterHandler {
  private static emitter: EventEmitter2;

  private constructor() {}

  public static getEmitter(): EventEmitter2 {
    if (!EventEmitterHandler.emitter) {
      EventEmitterHandler.emitter = new EventEmitter2({
        wildcard: true,
        delimiter: ".",
      });

      EventEmitterHandler.emitter.onAny((event, value) => {
        this.handleEventAsync(event, value);
      });
    }

    return EventEmitterHandler.emitter;
  }

  private static async handleEventAsync(
    event: string | string[],
    value: MochiResult
  ) {
    try {
      if (value.error) {
        logError(
          new MochiError(
            "Error in passed data while handling event",
            500,
            value.error
          )
        );
        return;
      }

      const rules = await new RuleService().getAllAsync({
        eventType: event,
        enabled: true,
      });

      if (!rules || rules.length === 0) {
        return;
      }

      for (const rule of rules) {
        const conditions = rule.conditions;
        const actions = rule.actions;

        let isConditionsMet = true;

        conditions?.forEach((condition) => {
          isConditionsMet = this.checkCondition(condition, value.data);
        });

        if (isConditionsMet) {
          this.performActionsAsync(value, actions);
        }
      }
    } catch (err: any) {
      logError(new MochiError("Error handling event", 500, err));
    }
  }

  private static checkCondition(conditions: ICondition, value: any): boolean {
    try {
      const { fieldPath, operator, value: conditionValue } = conditions;
      const field = fieldPath.split(".").reduce((acc, key) => acc[key], value);

      if (field === undefined) {
        return false;
      }

      switch (operator) {
        case "==":
          return field === conditionValue;
        case "!=":
          return field !== conditionValue;
        case ">":
          return field > conditionValue;
        case "<":
          return field < conditionValue;
        default:
          logError(new MochiError("Invalid operator"));
          return false;
      }
    } catch (err: any) {
      logError(new MochiError("Error checking condition", 500, err));
      return false;
    }
  }

  private static async performActionsAsync(
    data: MochiResult,
    actions: IAction[]
  ) {
    try {
      await Promise.all(
        actions.map(async (action) => {
          const listener = EventRegistry.getInstance().getListenerByEvent(
            action.targetPath
          );

          if (!listener) {
            logError(new MochiError("Listener not found"));
            return;
          }

          const { className, methodName, hasParams } = listener;

          const classPath = findClassFile(
            className,
            path.resolve(__dirname, "../")
          );

          if (!classPath) {
            logError(new MochiError("Class not found"));
            return;
          }

          const module = await import(classPath);
          const instance = new module.default();
          const method = instance[methodName].bind(instance);

          if (hasParams) {
            method(data, action.value);
          } else {
            method(data);
          }
        })
      );
    } catch (err: any) {
      logError(new MochiError("Error performing actions", 500, err));
    }
  }
}
