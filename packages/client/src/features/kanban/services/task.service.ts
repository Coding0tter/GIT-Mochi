import { mochiClient } from "@client/api/mochi/mochiClient.ts";
import { addNotification } from "@client/services/notificationService.ts";
import { currentTask } from "@client/shared/stores/keyboard-navigation.store.ts";
import type { ITaskV2 } from "shared/types";

export const fetchTasks = async () => {
  const { data } = await mochiClient.get<ITaskV2[]>("/task");
  return data;
};

export const updateStatus = async (taskId: number, status: string) => {
  const { data } = await mochiClient.patch<ITaskV2>(`/task/${taskId}/status`, {
    status,
  });
  return data;
};

export const markTaskAsRead = async (taskId: number) => {
  const { data } = await mochiClient.patch<{ taskId: number }>(
    `/task/${taskId}/read`,
  );
  return data;
};

export const copyBranch = () => {
  const task = currentTask();

  if (task) {
    navigator.clipboard.writeText(task.iid.toString());
    addNotification({
      type: "success",
      description: `Branch ${task.iid} copied to clipboard`,
    });
  }
};
