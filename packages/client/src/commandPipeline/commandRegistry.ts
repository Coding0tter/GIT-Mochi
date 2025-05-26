import { cloneDeep } from "lodash";
import type { CommandPipeline } from "./types";

const commandRegistry: CommandPipeline[] = [];

export const registerCommand = (command: CommandPipeline) => {
  if (!commandRegistry.some((cmd) => cmd.name === command.name))
    commandRegistry.push(cloneDeep(command));
};

export const getRegisteredCommands = () => {
  return [...commandRegistry];
};

export const getCommandByName = (name: string) => {
  return [...commandRegistry].find((cmd) => cmd.name === name);
};

export const resetCommandRegistry = () => {
  commandRegistry.length = 0;
};
