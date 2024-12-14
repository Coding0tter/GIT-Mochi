import { MochiError } from "@server/errors/mochiError";
import { Task } from "@server/models/task";
import { GitlabService } from "@server/services/gitlabService";
import SocketHandler from "@server/sockets";
import { logInfo, logError } from "@server/utils/logger";
import type { IComment } from "shared/types/task";

const syncCommentJob = async () => {
  try {
    logInfo("Syncing comments...");

    const gitlabService = new GitlabService();
    const merge_requests = await Task.find({ type: "merge_request" });

    if (merge_requests.length === 0) {
      logInfo("No merge requests found. Skipping sync...");
      return;
    }

    for (const mr of merge_requests) {
      const newComments = await gitlabService.getMergeRequestCommentsAsync(
        mr.projectId!,
        mr.gitlabIid?.toString()!
      );

      if (newComments) {
        // Detect changes in comments
        const hasChanges = detectCommentChanges(mr.comments, newComments);

        if (hasChanges) {
          if (
            mr.comments.filter(
              (item: IComment) =>
                !item.resolved && item.body.includes("@maxi") && !item.system
            ).length <
              newComments.filter(
                (item: any) =>
                  !item.resolved && item.body.includes("@maxi") && !item.system
              ).length &&
            (mr.status === "done" || mr.status === "review")
          ) {
            mr.status = "inprogress";
          }

          mr.comments = newComments;

          await mr.save();

          logInfo(
            `Found ${newComments.length} comments for MR #${mr.gitlabId}`
          );

          // Emit updated comments if there are changes
          if (newComments.length > 0) {
            SocketHandler.getInstance().getIO().emit("updateComments", {
              taskId: mr._id,
              comments: newComments,
            });
          }
        }
      }
    }

    logInfo("Comments synced!");
  } catch (error) {
    logError(new MochiError("Failed to sync comments", 500, error as Error));
  }
};

const detectCommentChanges = (
  oldComments: IComment[],
  newComments: IComment[]
): boolean => {
  if (oldComments.length !== newComments.length) {
    return true;
  }

  const oldCommentsMap = new Map(
    oldComments.map((comment) => [comment.originalId, comment])
  );
  const newCommentsMap = new Map(
    newComments.map((comment) => [comment.originalId, comment])
  );

  for (const [originalId, oldComment] of oldCommentsMap) {
    const newComment = newCommentsMap.get(originalId);

    if (
      !newComment ||
      oldComment.body !== newComment.body ||
      oldComment.resolved !== newComment.resolved
    ) {
      return true;
    }
  }

  return false;
};

export { syncCommentJob };
