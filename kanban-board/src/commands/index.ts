import { getRegisteredCommands } from "./commandRegistry";

import "./loadProjects";
import "./openCreateTask";
import "./setProject";
import "./getInput";
import "./createProject";
import "./setNewProjectAsCurrent";

export const COMMANDS = getRegisteredCommands();
