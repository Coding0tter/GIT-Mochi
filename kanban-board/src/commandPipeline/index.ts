import "./commands/setActiveProjectCommand";
import "./commands/createTaskCommand";
import "./commands/createProjectCommand";
import "./commands/createRuleCommand";

import { getRegisteredCommands } from "./commandRegistry";

export const COMMANDS = getRegisteredCommands();
