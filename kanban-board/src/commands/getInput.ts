import { registerCommand } from "./commandRegistry";

export const execute = async () => {};

registerCommand({
  text: "getInput",
  description: "Get input",
  action: "getInput",
  display: false,
  execute,
});
