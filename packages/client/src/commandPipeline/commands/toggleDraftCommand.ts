import { toggleDraft } from "../../services/gitlabService";
import { addNotification } from "../../services/notificationService";
import { getActiveDropdownValue } from "../../stores/commandStore";
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
        const user = getActiveDropdownValue().value;
        const selectedTask =
          getColumnTasks()[keyboardNavigationStore.selectedTaskIndex];

        await toggleDraft(selectedTask._id!);

        addNotification({
          title: "Draft flag toggled",
          description: "Draft flag has been toggled",
          type: "success",
        });

        next();
      },
    },
  ],
};

registerCommand(toggleDraftCommand);
