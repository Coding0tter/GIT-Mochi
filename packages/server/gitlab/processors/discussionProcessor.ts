import type { FieldProcessor } from "shared/types";
import { GitlabClient } from "../client";
import type { ITask } from "shared/types/task";

export default class DiscussionProcessor implements FieldProcessor {
  fieldName = "discussions";

  private client: GitlabClient;

  constructor() {
    this.client = new GitlabClient();
  }

  async process(entity: any, task: Partial<ITask>, projectId: string) {
    task.discussions = await this.client.getDiscussions(
      projectId,
      entity.iid,
      `${task.type}s`,
    );
  }

  shouldProcess(entity: any): boolean {
    return true;
  }
}
