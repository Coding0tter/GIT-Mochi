import { registerCommand } from "./commandRegistry";
import { setCommandPlaceholder, uiStore } from "../stores/uiStore";
import { setBuffer, setDropdownValues } from "../stores/commandStore";
import { createProjectAsync } from "../services/customProjectService";

export const execute = async () => {
  const value = uiStore.commandInputValue;

  if (value === "") return;

  const project = await createProjectAsync(value);
  if (project === null) return;
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
  text: "create project",
  description: "Create a new local project",
  action: "createProject",
  beforeAction: "getInput",
  nextAction: "setNewProjectAsCurrent",
  display: true,
  execute,
  createOptions,
});
