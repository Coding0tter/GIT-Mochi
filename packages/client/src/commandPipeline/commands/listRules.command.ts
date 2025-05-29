import { registerCommand } from "@client/commandPipeline/commandRegistry";
import type { CommandPipeline } from "@client/commandPipeline/types";
import {
  fetchRules,
  toggleRuleAsync,
  deleteRuleAsync,
} from "@client/services/ruleService";
import {
  setDropdownValues,
  getActiveDropdownValue,
  removeListener,
  setActiveDropdownIndex,
  commandStore,
  addListener,
} from "@client/stores/commandStore";
import type { Rule } from "@client/stores/ruleStore";

const listRulesCommand: CommandPipeline = {
  name: "listRules",
  description: "List all rules",
  steps: [
    {
      cleanDropdown: true,
      prompt: "Loading...",
      key: "loadrules",
      executeAsync: async ({ next }) => {
        const rules = await fetchRules();

        if (!rules) {
          setDropdownValues([
            {
              text: "No rules found",
              value: null,
            },
          ]);

          next();
          return;
        }

        setDropdownValues([
          ...rules.map((rule: Rule) => {
            let description = rule.eventType + " => ";

            description += rule.conditions
              .map((condition) => {
                return `${condition.fieldPath} ${condition.operator} ${condition.value}`;
              })
              .join(" && ");

            description += " => ";

            description += rule.actions
              .map((action) => `${action.targetPath}(${action.value ?? ""})`)
              .join(", ");

            return {
              text: `[${rule.enabled ? "on" : "off"}] ${rule.name}`,
              description,
              value: rule,
              showAlways: true,
            };
          }),
        ]);

        next();
      },
    },
    {
      prompt:
        "press <kbd>T</kbd> to toggle a rule, press <kbd>D</kbd> to delete a rule, press <kbd>Q</kbd> to quit",
      executeAsync: async ({ next, goto }) => {
        const handleKeydown = async (event: KeyboardEvent) => {
          if (["t", "d", "q", "j", "k"].includes(event.key.toLowerCase())) {
            event.preventDefault();

            if (event.key.toLowerCase() === "t") {
              await toggleRuleAsync(getActiveDropdownValue().value._id);
              goto("loadrules");
              removeListener();
            } else if (event.key.toLowerCase() === "d") {
              await deleteRuleAsync(getActiveDropdownValue().value._id);
              goto("loadrules");
              removeListener();
            } else if (event.key.toLowerCase() === "q") {
              next();
              removeListener();
            } else if (event.key.toLowerCase() === "j") {
              setActiveDropdownIndex(
                Math.min(
                  commandStore.activeDropdownIndex + 1,
                  commandStore.dropdownValues.length - 1
                )
              );
            } else if (event.key.toLowerCase() === "k") {
              setActiveDropdownIndex(
                Math.max(commandStore.activeDropdownIndex - 1, 0)
              );
            }
          }
        };

        addListener("keydown", handleKeydown);
      },
    },
  ],
};

registerCommand(listRulesCommand);
