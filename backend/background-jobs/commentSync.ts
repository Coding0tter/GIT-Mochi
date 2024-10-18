import { Task } from "../models/task";
import { GitlabService } from "../services/gitlabService";
import { SocketHandler } from "../sockets";
import { MochiError } from "../errors/mochiError";
import { logInfo } from "../utils/logger";

export interface Comment {
  body: string;
  images?: string[];
  resolved: boolean;
  author: {
    name: string;
    username: string;
  };
  system: boolean;
  originalId?: number;
}

const syncCommentJob = async () => {
  setInterval(async () => {
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
          mr._id as string
        );

        if (newComments) {
          // Detect changes in comments
          const hasChanges = detectCommentChanges(mr.comments, newComments);

          if (hasChanges) {
            if (
              mr.comments.filter(
                (item) => !item.resolved && item.body.includes("@maxi")
              ).length <
                newComments.filter(
                  (item: any) => !item.resolved && item.body.includes("@maxi")
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
          } else {
            logInfo(`No changes detected for MR #${mr.gitlabId}`);
          }
        }
      }

      logInfo("Comments synced!");
    } catch (error) {
      throw new MochiError("Failed to sync comments", 500, error as Error);
    }
  }, 60000);
};

const detectCommentChanges = (
  oldComments: Comment[],
  newComments: Comment[]
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
