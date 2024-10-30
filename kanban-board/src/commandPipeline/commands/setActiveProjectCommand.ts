import {
  getProjectAsync,
  loadCustomProjectsAsync,
  setProjectAsync,
} from "../../services/customProjectService";
import { loadGitLabProjectsAsync } from "../../services/gitlabService";
import { addNotification } from "../../services/notificationService";
import {
  getActiveDropdownValue,
  setDropdownValues,
} from "../../stores/commandStore";
import {
  setSelectedTaskIndex,
  setSelectedColumnIndex,
  setSelectedTaskIndexes,
} from "../../stores/keyboardNavigationStore";
import { handleGitlabSyncAsync, fetchTasksAsync } from "../../stores/taskStore";
import {
  Project,
  setCommandInputValue,
  setCurrentProject,
} from "../../stores/uiStore";
import { registerCommand } from "../commandRegistry";
import { CommandPipeline } from "../types";

const setActiveProjectCommand: CommandPipeline = {
  name: "setProject",
  description: "Set a project as active",
  steps: [
    {
      cleanDropdown: true,
      executeAsync: async (_, next) => {
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
        next();
      },
      prompt: "Loading projects...",
      onError: (error) => {
        addNotification({
          title: "Error",
          description: "Failed to load projects",
          type: "error",
        });
      },
    },
    {
      awaitInput: true,
      executeAsync: async (input, next) => {
        const selectedProject = getActiveDropdownValue().value as Project;
        let projectId = selectedProject.id;

        if (selectedProject.custom) {
          projectId = "custom_project/" + selectedProject.id;
        }

        await setProjectAsync(projectId);
        setCurrentProject(await getProjectAsync());

        if (!selectedProject.custom) await handleGitlabSyncAsync();

        await fetchTasksAsync();

        setSelectedTaskIndex(0);
        setSelectedColumnIndex(0);
        setSelectedTaskIndexes([0]);

        addNotification({
          title: "Success",
          description: "Project set successfully",
          type: "success",
        });

        next();
      },
      prompt: "Select a project to set as active",
      onError: (error, repeat) => {
        addNotification({
          title: "Error",
          description: "Failed to set project",
          type: "error",
        });
        repeat();
      },
    },
  ],
};

registerCommand(setActiveProjectCommand);
