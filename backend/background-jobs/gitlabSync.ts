import { GitlabService } from "../services/gitlabService";
import { SocketHandler } from "../sockets";
import { MochiError } from "../utils/error";
import { logInfo } from "../utils/logger";

const syncGitlabJob = async () => {
  setInterval(async () => {
    try {
      logInfo("Syncing comments...");

      const gitlabService = new GitlabService();

      const changes = await gitlabService.syncGitLabDataAsync();

      SocketHandler.getInstance().getIO().emit("updateTasks", changes);

      logInfo("Comments synced!");
    } catch (error) {
      throw new MochiError("Failed to sync comments", 500, error as Error);
    }
  }, 60000);
};

export { syncGitlabJob };
