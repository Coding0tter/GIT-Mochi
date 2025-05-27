import { GitlabClient } from "@server/clients/gitlab.client";
import type { FieldProcessor } from "shared/types";
import type { ITask } from "shared/types/task";

export default class NoteCountProcessor implements FieldProcessor {
  fieldName = "noteCount";
  private client = new GitlabClient();

  async process(entity: any, task: ITask, projectId: string): Promise<void> {
    const user = await this.client.getUserByAccessToken();
    const notes = await this.client.request({
      endpoint: `/projects/${projectId}/${task.type}s/${task.gitlabIid}/notes`,
      method: "GET",
    });

    task.relevantDiscussionCount = notes.filter(
      (item: any) =>
        !item.resolved && !item.system && item.body.includes(user.username),
    ).length;
  }

  shouldProcess(entity: any): boolean {
    return entity.type === "merge_request";
  }
}
