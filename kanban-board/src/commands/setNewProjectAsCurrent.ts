import {
  getProjectAsync,
  setProjectAsync,
} from "../services/customProjectService";
import { addNotification } from "../services/notificationService";
import { closeModalAndUnfocus } from "../services/uiService";
import {
  commandStore,
  getActiveDropdownValue,
  resetCommandline,
  setDropdownValues,
} from "../stores/commandStore";
import { fetchTasksAsync } from "../stores/taskStore";
import { setCommandPlaceholder, setCurrentProject } from "../stores/uiStore";
import { registerCommand } from "./commandRegistry";

export const execute = async () => {
  const choice = getActiveDropdownValue().value;
  if (choice === "yes") {
    await setProjectAsync("custom_project/" + commandStore.buffer);
    setCurrentProject(await getProjectAsync());

    await fetchTasksAsync();

    addNotification({
      title: "Success",
      description: "Project set successfully",
      type: "success",
    });
  }

  resetCommandline();
  closeModalAndUnfocus();
};

export const createOptions = async () => {
  setCommandPlaceholder("Do you want to set the new project as current?");
  setDropdownValues([
    { text: "Yes", value: "yes" },
    { text: "No", value: "no" },
  ]);
};

registerCommand({
  text: "setNewProjectAsCurrent",
  description: "Set new project as current",
  action: "setNewProjectAsCurrent",
  display: false,
  execute,
  createOptions,
});
