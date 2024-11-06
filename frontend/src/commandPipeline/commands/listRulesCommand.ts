import {
  deleteRuleAsync,
  fetchRules,
  toggleRuleAsync,
} from "../../services/ruleService";
import {
  getActiveDropdownValue,
  setDropdownValues,
} from "../../stores/commandStore";
import { Rule } from "../../stores/ruleStore";
import { registerCommand } from "../commandRegistry";
import { CommandPipeline } from "../types";

const listRulesCommand: CommandPipeline = {
  name: "listRules",
  description: "List all rules",
  steps: [
    {
      prompt: "Loading...",
      key: "loadrules",
      executeAsync: async (_, next) => {
        const rules = await fetchRules();

        if (!rules) {
          setDropdownValues([
            {
              text: "No rules found",
              value: null,
            },
          ]);
        }

        console.log(rules);

        setDropdownValues(
          rules.map((rule: Rule) => {
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
            console.log(rule.enabled);
            return {
              text: `[${rule.enabled ? "on" : "off"}] ${rule.name}`,
              description,
              value: rule,
              showAlways: true,
            };
          })
        );

        next();
      },
    },
    {
      prompt:
        "press <kbd>T</kbd> to toggle a rule, press <kbd>D</kbd> to delete a rule, press <kbd>Q</kbd> to quit",
      awaitInput: true,
      executeAsync: async (input, next, repeat, goto) => {
        if (input.toLowerCase() === "q") {
          next();

          return;
        }
        const rule = getActiveDropdownValue().value as Rule;

        if (input.toLowerCase() === "t") {
          await toggleRuleAsync(rule._id);
          goto("loadrules");

          return;
        }

        if (input.toLowerCase() === "d") {
          await deleteRuleAsync(rule._id);
          goto("loadrules");

          return;
        }

        repeat();
      },
    },
  ],
};

registerCommand(listRulesCommand);
