import { addNotification } from "../services/notificationService";
import { closeModalAndUnfocus } from "../services/uiService";
import { loadProjectsAsync } from "../services/utils";
import {
  Command,
  commandStore,
  DropdownValue,
  setCurrentCommand,
  setDropdownValues,
} from "../stores/commandStore";
import { setCommandInputValue } from "../stores/uiStore";
import { registerCommand } from "./commandRegistry";

export const execute = async (command: Partial<Command>) => {
  try {
    setCurrentCommand(command as Command);
    const projects = await loadProjectsAsync();

    setDropdownValues(
      projects.map(
        (project: { id: any; name_with_namespace: any; description: any }) => ({
          text: `(${project.id}): ${project.name_with_namespace}`,
          description: project.description,
          value: project.id,
          action: commandStore.pendingCommand?.action,
        })
      )
    );

    setCommandInputValue("");
  } catch (error) {
    console.error(error);
    addNotification({
      title: "Error",
      description: "Failed to load projects",
      type: "error",
    });
    closeModalAndUnfocus();
  }
};

registerCommand({
  text: "Set active project",
  description: "set active project",
  action: "loadProjects",
  display: false,
  execute,
});
