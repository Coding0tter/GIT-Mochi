import { Command } from "../stores/commandStore";

const commandRegistry: Command[] = [];

export const registerCommand = (command: Command) => {
  if (!commandRegistry.some((cmd) => cmd.action === command.action))
    commandRegistry.push(command);
};

export const getRegisteredCommands = () => {
  return [...commandRegistry];
};

export const getCommandByAction = (action: string) => {
  return [...commandRegistry].find((cmd) => cmd.action === action);
};
