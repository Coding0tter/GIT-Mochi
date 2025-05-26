import type { FieldProcessor } from "shared/types";
import type { ITask } from "shared/types/task";
import { GitlabClient } from "../client";

export default class PipelineProcessor implements FieldProcessor {
  fieldName = "pipeline";

  private client: GitlabClient;

  constructor() {
    this.client = new GitlabClient();
  }

  async process(
    entity: any,
    task: Partial<ITask>,
    projectId: string,
  ): Promise<void> {
    const pipelineState = await this.client.getPipelineState(
      projectId,
      task.gitlabIid!,
    );

    task.pipelineStatus = pipelineState.pipelineStatus;
    task.latestPipelineId = pipelineState.latestPipelineId;
    task.pipelineReports = pipelineState.pipelineReports;
  }

  shouldProcess(entity: any): boolean {
    return entity.type === "merge_request";
  }
}
