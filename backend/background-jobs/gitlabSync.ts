import { GitlabService } from "../services/gitlabService";
import { SocketHandler } from "../sockets";
import { MochiError } from "../errors/mochiError";
import { logError, logInfo } from "../utils/logger";

const syncGitlabJob = async () => {
  setInterval(async () => {
    try {
      logInfo("Syncing Gitlab Issues and MergeRequests...");

      const gitlabService = new GitlabService();

      const changes = await gitlabService.syncGitLabDataAsync();

      SocketHandler.getInstance().getIO().emit("updateTasks", changes);

      logInfo("Gitlab Issues and MergeRequests synced!");
    } catch (error) {
      logError(
        new MochiError(
          "Failed to sync Gitlab Issues and MergeRequests",
          500,
          error as Error
        )
      );
    }
  }, 60000);
};

export { syncGitlabJob };
