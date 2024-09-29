import {
  Command,
  setDropdownValues,
  setWaitingForInput,
} from "../stores/commandStore";
import { setCommandInputValue } from "../stores/uiStore";
import { registerCommand } from "./commandRegistry";

export const execute = async () => {
  setCommandInputValue("");
};

registerCommand({
  text: "getInput",
  description: "Get input",
  action: "getInput",
  display: false,
  execute,
});
