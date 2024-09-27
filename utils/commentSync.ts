import { Setting } from "../models/setting";
import { Task } from "../models/task";
import { getMergeRequestComments } from "../services/gitlabService";
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

          mr.comments.forEach((comment) => {
            const imageRegex = /!\[.*?\]\((.*?)\)/g;
            const matches = [...comment.body.matchAll(imageRegex)];
            const images = matches.map(
              (match) =>
                `${process.env.GIT_URL}/-/project/${mr.projectId}` + match[1]
            );

            const cleanedText = comment.body.replace(imageRegex, "").trim();

            comment.body = cleanedText;
            comment.images = images;
          });

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
