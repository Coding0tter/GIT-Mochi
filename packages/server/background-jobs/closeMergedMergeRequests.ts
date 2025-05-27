import { GitlabService } from "../services/gitlab.service";
import { SocketHandler } from "../sockets";
import { MochiError } from "../errors/mochi.error";
import { logError, logInfo } from "../utils/logger";

const closeMergedMRJob = async () => {
  try {
    logInfo("Close merged MergeRequests...");

    const gitlabService = new GitlabService();

    const changes = await gitlabService.closeMergedMergeRequestsAsync();

    SocketHandler.getInstance().getIO().emit("updateTasks", changes);

    logInfo("Closed merged MergeRequests synced!");
  } catch (error) {
    logError(
      new MochiError("Failed to close merge requests", 500, error as Error),
    );
  }
};

export { closeMergedMRJob };
