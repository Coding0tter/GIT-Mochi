import { settingsService } from "@client/services/settingsService";
import {
  assignTaskForReview,
  getGitLabUsersAsync,
} from "../../services/gitlabService";
import { addNotification } from "../../services/notificationService";
import { keyboardNavigationStore } from "../../stores/keyboardNavigationStore";
import { getColumnTasks } from "../../stores/taskStore";
import { showWheel, hideWheel, wheelStore } from "../../stores/wheelStore";
import { registerCommand } from "../commandRegistry";
import type { CommandPipeline } from "../types";

const assignTaskForReviewComand: CommandPipeline = {
  name: "assignTaskForReview",
  description: "Assign a task to a user for a review",
  steps: [
    {
      prompt: "Assigning task for review",
      executeAsync: async ({ next }) => {
        const reviewerIds =
          await settingsService.getSettingByKey<string[]>("reviewers");

        if (!reviewerIds || reviewerIds.length === 0) {
          addNotification({
            title: "Error",
            description: "No reviewers configured in settings",
            type: "error",
          });
          next();
          return;
        }

        const allUsers = await getGitLabUsersAsync();

        const reviewers = reviewerIds
          .map((id) => allUsers.find((u: any) => u.id.toString() === id))
          .filter(Boolean)
          .map((user: any) => ({
            id: user.id.toString(),
            avatar_url: user.avatar_url,
            username: user.username,
            name: user.name,
          }));

        if (reviewers.length === 0) {
          addNotification({
            title: "Error",
            description: "No valid reviewers found",
            type: "error",
          });
          next();
          return;
        }

        showWheel(reviewers);

        const checkInterval = setInterval(() => {
          if (wheelStore.selectedReviewer) {
            clearInterval(checkInterval);

            const selectedTask =
              getColumnTasks()[keyboardNavigationStore.selectedTaskIndex];

            assignTaskForReview(selectedTask._id!, wheelStore.selectedReviewer)
              .then(() => {
                addNotification({
                  title: "Task assigned for review",
                  description: "Task has been assigned",
                  type: "success",
                });

                // Hide wheel after 2 seconds
                setTimeout(() => {
                  hideWheel();
                  next();
                }, 2000);
              })
              .catch(() => {
                addNotification({
                  title: "Error",
                  description: "Failed to assign task for review",
                  type: "error",
                });
                hideWheel();
                next();
              });
          }
        }, 100);
      },
    },
  ],
};

registerCommand(assignTaskForReviewComand);
