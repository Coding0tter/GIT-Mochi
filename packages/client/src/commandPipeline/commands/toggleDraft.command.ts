import { toggleDraft } from "../../services/gitlabService";
import { keyboardNavigationStore } from "../../stores/keyboardNavigationStore";
import { getColumnTasks } from "../../stores/taskStore";
import { registerCommand } from "../commandRegistry";
import type { CommandPipeline } from "../types";

const toggleDraftCommand: CommandPipeline = {
  name: "toggleDraft",
  description: "Toggle the draft flag",
  steps: [
    {
      prompt: "Updating draft flag...",
      executeAsync: async ({ next }) => {
        const selectedTask =
          getColumnTasks()[keyboardNavigationStore.selectedTaskIndex];

        await toggleDraft(selectedTask._id!);

        next();
      },
    },
  ],
};

registerCommand(toggleDraftCommand);
