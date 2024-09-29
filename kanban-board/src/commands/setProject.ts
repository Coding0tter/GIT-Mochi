import {
  getProjectAsync,
  setProjectAsync,
} from "../services/customProjectService";
import { addNotification } from "../services/notificationService";
import { closeModalAndUnfocus } from "../services/uiService";
import {
  getActiveDropdownValue,
  resetCommandline,
} from "../stores/commandStore";
import { fetchTasksAsync, handleGitlabSyncAsync } from "../stores/taskStore";
import { Project, setCurrentProject } from "../stores/uiStore";
import { registerCommand } from "./commandRegistry";

export const execute = async () => {
  try {
    const project = getActiveDropdownValue().value as Project;

    let projectId = project.id;

    if (project.custom) {
      projectId = "custom_project/" + project.id;
    }

    await setProjectAsync(projectId);
    if (!project.custom) {
      await handleGitlabSyncAsync();
    } else {
      await fetchTasksAsync();
    }
    setCurrentProject(await getProjectAsync());

    addNotification({
      title: "Success",
      description: "Project set successfully",
      type: "success",
    });

    resetCommandline();
    closeModalAndUnfocus();
  } catch (error) {
    addNotification({
      title: "Error",
      description: "Failed to set project",
      type: "error",
    });
  }
};

registerCommand({
  text: "select project",
  description: "Set the acitve project for the board",
  action: "setProject",
  beforeAction: "loadProjects",
  display: true,
  execute,
});
