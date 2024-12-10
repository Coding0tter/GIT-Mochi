import { MochiError } from "../errors/mochiError";
import { Task } from "../models/task";
import { GitlabService } from "../services/gitlabService";
import { logError, logInfo } from "../utils/logger";

const syncPipelineStatusJob = async () => {
  try {
    logInfo("Syncing pipeline statuses...");

    const gitlabService = new GitlabService();
    const merge_requests = await Task.find({ type: "merge_request" });

    if (merge_requests.length === 0) {
      logInfo("No merge requests found. Skipping sync...");
      return;
    }

    for (const mr of merge_requests) {
      const pipeline = await gitlabService.getLatestPipelineAsync(
        mr.projectId!,
        mr.gitlabIid?.toString()!
      );

      if (pipeline) {
        if (mr.pipelineStatus !== pipeline.status) {
          mr.pipelineStatus = pipeline.status;
          mr.latestPipelineId = pipeline.id;

          if (pipeline.status === "failed") {
            const failedTests = await gitlabService.getFaultyTestCasesAsync(
              mr.projectId!,
              pipeline.id
            );

            mr.pipelineReports = failedTests.map((test: any) => {
              return {
                name: test.name ?? "Unknown",
                classname: test.classname ?? "Unknown",
                attachment_url: test.attachment_url ?? "",
              };
            });
          }

          await mr.save();
        }
      }
    }

    logInfo("Pipeline statuses synced successfully.");
  } catch (error) {
    logError(
      new MochiError("Failed to sync pipeline statuses", 500, error as Error)
    );
  }
};

export { syncPipelineStatusJob };
