import { cloneDeep } from "lodash";
import { fetchEmitters } from "../../services/ruleService";
import {
  commandStore,
  getActiveDropdownValue,
  setBuffer,
  setDropdownValues,
} from "../../stores/commandStore";
import { Rule } from "../../stores/ruleStore";
import { registerCommand } from "../commandRegistry";
import { CommandPipeline } from "../types";

const BaseRule: Rule = {
  name: "",
  eventType: "",
  conditions: [],
  actions: [],
  enabled: true,
};

const createRuleCommand: CommandPipeline = {
  name: "createRule",
  description: "Create a new rule",
  steps: [
    {
      prompt: "Loading events...",
      executeAsync: async (_, next) => {
        const events = await fetchEmitters();
        setDropdownValues(
          events.map((event) => ({
            text: event.eventNamespace + "." + event.eventType,
            value: event.eventNamespace + "." + event.eventType,
          }))
        );
        next();
      },
    },
    {
      prompt: "Choose an event",
      awaitInput: true,
      executeAsync: async (_, next) => {
        const eventType = getActiveDropdownValue().value;

        const rule = { ...BaseRule, eventType };

        setBuffer(rule);
        next();
      },
    },
    {
      prompt: "Add a condition. Leave empty to move on",
      awaitInput: true,
      cleanDropdown: true,
      executeAsync: async (input, next, retry) => {
        if (input.trim() === "") {
          next();
          return;
        }

        const regex = /^(\S+)\s+(==|!=|>|<)\s+(.+)$/;
        const match = input.match(regex);

        if (!match) {
          console.error("Invalid condition format. Use: field operator value");
          retry();
          return;
        }

        const [, fieldPath, operator, rawValue] = match;

        const value = isNaN(Number(rawValue)) ? rawValue : Number(rawValue);

        const condition = { fieldPath, operator, value };

        const rule = cloneDeep(commandStore.buffer) as Rule;
        rule.conditions.push(condition);

        console.log("Updated rule with new condition:", rule);
        setBuffer(rule);

        retry();
      },
    },
    {
      prompt: "Add an action. Leave empty to move on",
      awaitInput: true,
      cleanDropdown: true,
      executeAsync: async (input, next, retry) => {
        console.log("Adding action", input);
      },
    },
  ],
};

registerCommand(createRuleCommand);
