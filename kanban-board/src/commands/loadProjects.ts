import { loadCustomProjectsAsync } from "../services/customProjectService";
import { loadGitLabProjectsAsync } from "../services/gitlabService";
import { addNotification } from "../services/notificationService";
import { setDropdownValues } from "../stores/commandStore";
import { Project, setCommandInputValue } from "../stores/uiStore";
import { registerCommand } from "./commandRegistry";

export const execute = async () => {
  try {
    const gitlabProjects = await loadGitLabProjectsAsync();
    const customProjects = await loadCustomProjectsAsync();

    setDropdownValues(
      [...customProjects, ...gitlabProjects].map((project: Project) => ({
        text: project.custom
          ? `(custom) ${project.name}`
          : `(${project.id}): ${project.name}`,
        description: project.description,
        value: project,
      }))
    );

    setCommandInputValue("");
  } catch (error) {
    addNotification({
      title: "Error",
      description: "Failed to load projects",
      type: "error",
    });
  }
};

registerCommand({
  text: "Set active project",
  description: "set active project",
  action: "loadProjects",
  display: false,
  execute,
});
