import { getRegisteredCommands } from "./commandRegistry";

import "./loadProjects";
import "./openCreateTask";
import "./setProject";
import "./getInput";
import "./createProject";

export const COMMANDS = getRegisteredCommands();
