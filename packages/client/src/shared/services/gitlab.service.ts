import { mochiClient } from "@client/api/mochi/mochiClient.ts";
import { addNotification } from "@client/services/notificationService";
import { setSyncing } from "@client/shared/stores/uiStore";

export const createMergeRequest = async (
  taskId: number,
  branchName: string,
) => {
  await mochiClient.post(`/gitlab/${taskId}`, {
    branchName,
  });
};

export const fetchPipelineDetails = async (mrIid: number) => {
  const { data } = await mochiClient.get(`/gitlab/pipeline/${mrIid}`);
  return data;
};

export const sync = async () => {
  setSyncing(true);
  await mochiClient.post(`/gitlab/sync`);

  addNotification({
    type: "success",
    title: "Success",
    description: "Synchronization finished.",
  });
  setSyncing(false);
};
