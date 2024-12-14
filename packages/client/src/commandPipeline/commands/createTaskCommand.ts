import { openCreateModal } from "../../services/modalService";
import { registerCommand } from "../commandRegistry";
import { type CommandPipeline } from "../types";

const createTaskCommand: CommandPipeline = {
  name: "createTask",
  description: "Create a new task",
  steps: [
    {
      cleanDropdown: true,
      executeAsync: async () => {
        openCreateModal();
      },
      prompt: "Opening create task modal...",
    },
  ],
};

registerCommand(createTaskCommand);
