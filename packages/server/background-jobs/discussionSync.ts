import { MochiError } from "@server/errors/mochiError";
import { Task } from "@server/models/task";
import { GitlabService } from "@server/services/gitlabService";
import SocketHandler from "@server/sockets";
import { logInfo, logError } from "@server/utils/logger";
import { discussionsEqual } from "shared/utils/isEqual";

const syncDiscussionJob = async () => {
  try {
    logInfo("Syncing discussions...");

    const gitlabService = new GitlabService();
    const tasks = await Task.find({ custom: false });

    if (tasks.length === 0) {
      logInfo("No tasks found. Skipping sync...");
      return;
    }

    for (const task of tasks) {
      const newDiscussions = await gitlabService.getDiscussionsAsync(
        task.projectId!,
        task.gitlabIid!.toString(),
        task.type === "issue" ? "issues" : "merge_requests"
      );

      if (newDiscussions) {
        const hasChanges = !discussionsEqual(task.discussions, newDiscussions);

        if (!hasChanges) {
          continue;
        }

        await Task.updateOne(
          { _id: task._id },
          {
            discussions: [...newDiscussions],
          }
        );

        logInfo(
          `Found ${newDiscussions.length} discussions for task ${task.gitlabIid}`
        );

        if (newDiscussions.length > 0) {
          SocketHandler.getInstance().getIO().emit("updateDiscussions", {
            taskId: task._id,
            discussions: newDiscussions,
          });
        }
      }
    }

    logInfo("Discussions synced successfully");
  } catch (error) {
    logError(new MochiError("Failed to sync discussions", 500, error as Error));
  }
};

export { syncDiscussionJob };
