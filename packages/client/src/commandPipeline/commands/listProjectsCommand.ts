import { registerCommand } from "@client/commandPipeline/commandRegistry";
import type { CommandPipeline } from "@client/commandPipeline/types";
import {
  loadCustomProjectsAsync,
  setProjectAsync,
  getProjectAsync,
  deleteProjectAsync,
} from "@client/services/customProjectService";
import { loadGitLabProjectsAsync } from "@client/services/gitlabService";
import { addNotification } from "@client/services/notificationService";
import {
  setDropdownValues,
  getActiveDropdownValue,
  removeListener,
  setActiveDropdownIndex,
  commandStore,
  addListener,
} from "@client/stores/commandStore";
import {
  setSelectedTaskIndex,
  setSelectedColumnIndex,
  setSelectedTaskIndexes,
} from "@client/stores/keyboardNavigationStore";
import {
  handleGitlabSyncAsync,
  fetchTasksAsync,
} from "@client/stores/taskStore";
import {
  type Project,
  setCommandInputValue,
  setCurrentProject,
} from "@client/stores/uiStore";

const setActiveProjectCommand: CommandPipeline = {
  name: "listProjects",
  description: "View all projects",
  steps: [
    {
      key: "loadProjects",
      executeAsync: async ({ next }) => {
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
      executeAsync: async ({ next, goto }) => {
        const handleKeydown = async (event: KeyboardEvent) => {
          if (["Enter", "d", "q", "j", "k"].includes(event.key)) {
            event.preventDefault();

            if (event.key === "Enter") {
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
            } else if (event.key.toLowerCase() === "d") {
              const project = getActiveDropdownValue().value as Project;
              await deleteProjectAsync(project.id);
              goto("loadProjects");
            } else if (event.key.toLowerCase() === "q") {
              next();
              removeListener();
            } else if (event.key.toLowerCase() === "j") {
              setActiveDropdownIndex(
                Math.min(
                  commandStore.activeDropdownIndex + 1,
                  commandStore.dropdownValues.length - 1
                )
              );
            } else if (event.key.toLowerCase() === "k") {
              setActiveDropdownIndex(
                Math.max(commandStore.activeDropdownIndex - 1, 0)
              );
            }
          }
        };

        addListener("keydown", handleKeydown);
      },
      prompt:
        "press <kbd>Enter</kbd> to set project, press <kbd>D</kbd> to delete, press <kbd>Q</kbd> to quit",
    },
  ],
};

registerCommand(setActiveProjectCommand);
