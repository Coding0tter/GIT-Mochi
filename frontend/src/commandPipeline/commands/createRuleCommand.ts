import { cloneDeep } from "lodash";
import {
  createRuleAsync,
  fetchEmitters,
  fetchListeners,
} from "../../services/ruleService";
import {
  commandStore,
  getActiveDropdownValue,
  setBuffer,
  setDropdownValues,
} from "../../stores/commandStore";
import { Rule } from "../../stores/ruleStore";
import { registerCommand } from "../commandRegistry";
import { CommandPipeline } from "../types";
import { addNotification } from "../../services/notificationService";
import { getGitLabUsersAsync } from "../../services/gitlabService";

const BaseRule: Partial<Rule> = {
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
      executeAsync: async ({ next }) => {
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
      executeAsync: async ({ next }) => {
        const eventType = getActiveDropdownValue().value;

        const rule = cloneDeep(BaseRule) as Rule;
        rule.eventType = eventType;

        setBuffer(rule);
        next();
      },
    },
    {
      prompt: "Enter condition",
      dropdownValues: () => {
        return [
          {
            text: "Add condition (eg. field == value). Leave empty to move on",
            showAlways: true,
          },
          ...commandStore.buffer?.conditions.map((condition: any) => ({
            text:
              condition.fieldPath +
              " " +
              condition.operator +
              " " +
              condition.value,
            showAlways: true,
          })),
        ];
      },
      awaitInput: true,
      executeAsync: async ({ input, next, repeat }) => {
        if (input.trim() === "") {
          next();
          return;
        }

        const regex = /^(\S+)\s+(==|!=|>|<)\s+(.+)$/;
        const match = input.match(regex);

        if (!match) {
          console.error("Invalid condition format. Use: field operator value");
          repeat();
          return;
        }

        const [, fieldPath, operator, rawValue] = match;

        const value = isNaN(Number(rawValue)) ? rawValue : Number(rawValue);

        const condition = { fieldPath, operator, value };

        const rule = cloneDeep(commandStore.buffer) as Rule;
        rule.conditions.push(condition);

        setBuffer(rule);

        repeat();
      },
    },
    {
      key: "loadActions",
      prompt: "Loading actions...",
      executeAsync: async ({ next }) => {
        const actions = await fetchListeners();
        setDropdownValues([
          ...actions.map((action) => ({
            text:
              action.eventNamespace +
              "." +
              action.eventType +
              (action.hasParams ? " (with params)" : ""),
            value: action,
          })),
          { text: "Finish", value: "finish" },
        ]);
        next();
      },
    },
    {
      prompt: "Add an action. Or choose 'Finish' to complete the rule",
      awaitInput: true,
      executeAsync: async ({ next, repeat, goto }) => {
        const action = getActiveDropdownValue().value;

        if (action === "finish") {
          goto("enterName");
          return;
        }

        const rule = cloneDeep(commandStore.buffer) as Rule;
        rule.actions.push({
          targetPath: action.eventNamespace + "." + action.eventType,
          value: null,
        });
        setBuffer(rule);

        if (action.hasParams) {
          next();
        } else {
          repeat();
        }
      },
    },
    {
      prompt: "Loading values...",
      executeAsync: async ({ next }) => {
        // TODO: move to backend (something like allowedValuesGenerator)
        const rule = cloneDeep(commandStore.buffer) as Rule;
        const parts = rule.actions.at(-1)?.targetPath.split(".");
        if (parts?.at(0) === "gitlab") {
          if (parts?.at(1) === "updateAssignee") {
            const users = await getGitLabUsersAsync();
            setDropdownValues(
              users.map((user: any) => ({
                text: user.name,
                value: user,
              }))
            );
            next();
            return;
          }
        }

        setDropdownValues([
          { text: "Enter a value", value: "enterValue", showAlways: true },
          { text: "Finish", value: "finish", showAlways: true },
        ]);

        next();
      },
    },
    {
      prompt: "Enter a value",
      awaitInput: true,
      executeAsync: async ({ input, repeat, goto }) => {
        if (input.trim() === "finish") {
          repeat();
          return;
        }
        const dropdownValue = getActiveDropdownValue().value;
        const rule = cloneDeep(commandStore.buffer) as Rule;

        if (typeof dropdownValue === "string") {
          rule.actions[rule.actions.length - 1].value = input;
        } else {
          rule.actions[rule.actions.length - 1].value = dropdownValue;
        }

        setBuffer(rule);

        goto("loadActions");
      },
    },
    {
      key: "enterName",
      prompt: "Enter a name for the rule",
      awaitInput: true,
      cleanDropdown: true,
      executeAsync: async ({ input, next }) => {
        const rule = cloneDeep(commandStore.buffer) as Rule;
        rule.name = input;

        setBuffer(rule);

        next();
      },
    },
    {
      prompt: "Saving...",
      cleanDropdown: true,
      executeAsync: async ({ next }) => {
        const rule = cloneDeep(commandStore.buffer) as Rule;
        await createRuleAsync(rule);
        next();
      },
      onError: (error) => {
        addNotification({
          type: "error",
          title: "Failed to create rule",
          description: error.message,
        });
      },
    },
  ],
};

registerCommand(createRuleCommand);
