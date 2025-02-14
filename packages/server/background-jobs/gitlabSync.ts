import { GitlabService } from "../services/gitlabService";
import { SocketHandler } from "../sockets";
import { MochiError } from "../errors/mochiError";
import { logError, logInfo } from "../utils/logger";

const syncGitlabJob = async () => {
  try {
    logInfo("Syncing Gitlab Issues and MergeRequests...");

    const gitlabService = new GitlabService();

    await gitlabService.syncGitLabDataAsync();

    logInfo("Gitlab Issues and MergeRequests synced!");
  } catch (error) {
    logError(
      new MochiError(
        "Failed to sync Gitlab Issues and MergeRequests",
        500,
        error as Error,
      ),
    );
  }
};

export { syncGitlabJob };
