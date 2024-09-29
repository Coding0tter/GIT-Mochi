import { registerCommand } from "./commandRegistry";
import { setCommandPlaceholder, uiStore } from "../stores/uiStore";
import { setBuffer, setDropdownValues } from "../stores/commandStore";
import { createProjectAsync } from "../services/customProjectService";

export const execute = async () => {
  const value = uiStore.commandInputValue;
  const project = await createProjectAsync(value);
  if (!project) return;
  setBuffer(project._id);
};

export const createOptions = async () => {
  setCommandPlaceholder("Enter a name for the new project");
  setDropdownValues([
    {
      text: "Enter a name for the new project",
      showAlways: true,
    },
  ]);
};

registerCommand({
  text: "createProject",
  description: "Create project",
  action: "createProject",
  beforeAction: "getInput",
  nextAction: "setNewProjectAsCurrent",
  display: true,
  execute,
  createOptions,
});
