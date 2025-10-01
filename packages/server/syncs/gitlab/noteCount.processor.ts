import { GitlabClient } from "@server/clients/gitlab.client";
import { MochiError } from "@server/errors/mochi.error";
import { UserService } from "@server/services/user.service";
import type { FieldProcessor } from "shared/types";
import type { ITask } from "shared/types/task";

export default class NoteCountProcessor implements FieldProcessor {
  fieldName = "noteCount";
  private client = new GitlabClient();
  private userService = new UserService();

  async process(entity: any, task: ITask, projectId: string): Promise<void> {
    const user = await this.userService.getUser();
    const notes = await this.client.request({
      endpoint: `/projects/${projectId}/${task.type}s/${task.gitlabIid}/notes`,
      method: "GET",
    });

    if (!user) {
      throw new MochiError("User not found");
    }

    const reviewers = task.reviewers?.map((r) => r.id);

    task.relevantDiscussionCount = notes.filter(
      (item: any) =>
        !item.resolved &&
        !item.system &&
        (item.body.includes(user.username) ||
          (reviewers?.includes(item.author.id) &&
            item.author.id !== user.gitlabId)),
    ).length;
  }

  shouldProcess(entity: any): boolean {
    return entity.type === "merge_request";
  }
}
