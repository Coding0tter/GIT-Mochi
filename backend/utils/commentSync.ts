import { Task } from "../models/task";
import { getMergeRequestComments } from "../services/gitlabService";
import { logError, logInfo } from "./logger";

const periodicallySyncComments = async () => {
  setInterval(async () => {
    try {
      logInfo("Syncing comments...");
      const merge_requests = await Task.find({ type: "merge_request" });

      if (merge_requests.length === 0) {
        logInfo("No merge requests found. Skipping sync...");
        return;
      }

      for (const mr of merge_requests) {
        const comments = await getMergeRequestComments(
          mr.gitlabIid?.toString()!,
          mr.projectId!
        );

        if (comments) {
          if (
            mr.comments.filter(
              (item) => !item.resolved && item.body.includes("@maxi")
            ).length <
              comments.filter(
                (item) => !item.resolved && item.body.includes("@maxi")
              ).length &&
            (mr.status === "done" || mr.status === "review")
          ) {
            mr.status = "inprogress";
          }

          mr.comments = comments;

          await mr.save();

          logInfo(`Found ${comments.length} comments for MR #${mr.gitlabIid}`);
        }
      }

      logInfo("Comments synced!");
    } catch (error) {
      logError(`Failed to sync comments: ${error}`);
    }
  }, 60000);
};

export { periodicallySyncComments };
