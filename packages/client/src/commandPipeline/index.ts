const commandModules = import.meta.glob("./commands/*.command.ts");

for (const path in commandModules) {
  await commandModules[path](); // This will load each command file
}

import { getRegisteredCommands } from "./commandRegistry";
export const COMMANDS = [...getRegisteredCommands()];
