import {
  assignTaskAsync,
  getGitLabUsersAsync,
} from "../../services/gitlabService";
import { addNotification } from "../../services/notificationService";
import {
  getActiveDropdownValue,
  setDropdownValues,
} from "../../stores/commandStore";
import { keyboardNavigationStore } from "../../stores/keyboardNavigationStore";
import { getColumnTasks } from "../../stores/taskStore";
import { registerCommand } from "../commandRegistry";
import type { CommandPipeline } from "../types";

const assignTaskComand: CommandPipeline = {
  name: "assignTask",
  description: "Assign a task to a user",
  steps: [
    {
      prompt: "Loading users...",
      executeAsync: async ({ next }) => {
        const users = await getGitLabUsersAsync();

        setDropdownValues(
          users.map((user: any) => ({
            text: user.name,
            value: user,
          }))
        );

        next();
      },
    },
    {
      prompt: "Choose a user to assign the task to",
      awaitInput: true,
      executeAsync: async ({ next }) => {
        const user = getActiveDropdownValue().value;
        const selectedTask =
          getColumnTasks()[keyboardNavigationStore.selectedTaskIndex];

        await assignTaskAsync(selectedTask._id!, user.id);

        addNotification({
          title: "Task assigned",
          description: "Task has been assigned",
          type: "success",
        });

        next();
      },
    },
  ],
};

registerCommand(assignTaskComand);
