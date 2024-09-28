import { Command, setDropdownValues } from "../stores/commandStore";
import { setCommandInputValue } from "../stores/uiStore";
import { registerCommand } from "./commandRegistry";

export const execute = async (_command: Partial<Command>) => {
  setCommandInputValue("");
  setDropdownValues([
    {
      text: "Enter a value",
      description: "",
      showAlways: true,
    },
  ]);
};

registerCommand({
  text: "getInput",
  description: "Get input",
  action: "getInput",
  display: false,
  execute,
});
