import { settingsService } from "@client/services/settingsService";
import { assignTaskForReview } from "../../services/gitlabService";
import { addNotification } from "../../services/notificationService";
import { keyboardNavigationStore } from "../../stores/keyboardNavigationStore";
import { getColumnTasks } from "../../stores/taskStore";
import { registerCommand } from "../commandRegistry";
import type { CommandPipeline } from "../types";

const assignTaskForReviewComand: CommandPipeline = {
  name: "assignTaskForReview",
  description: "Assign a task to a user for a review",
  steps: [
    {
      prompt: "Assigning task for review",
      awaitInput: true,
      executeAsync: async ({ next }) => {
        const users =
          await settingsService.getSettingByKey<string[]>("reviewers");

        //random user
        const user = users[Math.floor(Math.random() * users.length)];

        const selectedTask =
          getColumnTasks()[keyboardNavigationStore.selectedTaskIndex];

        try {
          await assignTaskForReview(selectedTask._id!, user);

          addNotification({
            title: "Task assigned for review",
            description: "Task has been assigned",
            type: "success",
          });
        } catch {
          addNotification({
            title: "Error",
            description: "Failed to assign task for review",
            type: "error",
          });
        }

        next();
      },
    },
  ],
};

registerCommand(assignTaskForReviewComand);
