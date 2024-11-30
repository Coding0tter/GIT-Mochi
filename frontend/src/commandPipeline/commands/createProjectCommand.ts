import {
  createProjectAsync,
  getProjectAsync,
  setProjectAsync,
} from "../../services/customProjectService";
import { addNotification } from "../../services/notificationService";
import {
  commandStore,
  getActiveDropdownValue,
  setBuffer,
} from "../../stores/commandStore";
import { fetchTasksAsync } from "../../stores/taskStore";
import { setCurrentProject } from "../../stores/uiStore";
import { registerCommand } from "../commandRegistry";
import { CommandPipeline } from "../types";

const createProjectCommand: CommandPipeline = {
  name: "createProject",
  description: "Create a new project and set it as active",
  steps: [
    {
      awaitInput: true,
      cleanDropdown: true,
      executeAsync: async ({ input, next, repeat }) => {
        if (input === "") {
          repeat();
          return;
        }

        const project = await createProjectAsync(input);
        if (project === null) {
          addNotification({
            title: "Error",
            description: "Failed to create project",
            type: "error",
          });

          repeat();
          return;
        }
        setBuffer(project._id);
        next();
      },
      prompt: "Enter a name for the new project",
    },
    {
      awaitInput: true,
      executeAsync: async ({ next }) => {
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

          next();
        }
      },
      prompt: "Do you want to set the new project as active?",
      dropdownValues: [
        {
          text: "Yes",
          value: "yes",
        },
        {
          text: "No",
          value: "no",
        },
      ],
    },
  ],
};

registerCommand(createProjectCommand);
