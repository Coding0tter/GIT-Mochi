import { GitlabService } from "../services/gitlabService";
import { SocketHandler } from "../sockets";
import { MochiError } from "../errors/mochiError";
import { logError, logInfo } from "../utils/logger";

const closeMergedMRJob = async () => {
  setInterval(async () => {
    try {
      logInfo("Close merged MergeRequests...");

      const gitlabService = new GitlabService();

      const changes = await gitlabService.closeMergedMergeRequestsAsync();

      SocketHandler.getInstance().getIO().emit("updateTasks", changes);

      logInfo("Closed merged MergeRequests synced!");
    } catch (error) {
      logError(
        new MochiError("Failed to close merge requests", 500, error as Error)
      );
    }
  }, 60000);
};

export { closeMergedMRJob };
