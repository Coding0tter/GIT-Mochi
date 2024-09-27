import { getMergeRequestComments } from "../kanban-board/src/services/utils";
import { Task } from "../models/task";
import { logError, logInfo } from "./logger";

const periodicallySyncComments = async () => {
  setInterval(async () => {
    try {
      logInfo("Syncing comments...");
      const merge_requests = await Task.find({ type: "merge_request" });

      for (const mr of merge_requests) {
        const comments = await getMergeRequestComments(
          mr.gitlabIid?.toString()!
        );

        if (comments) {
          mr.comments = comments;
          await mr.save();
        }
      }

      logInfo("Comments synced!");
    } catch (error) {
      logError(`Failed to sync comments: ${error}`);
    }
  }, 60000);
};

export { periodicallySyncComments };
