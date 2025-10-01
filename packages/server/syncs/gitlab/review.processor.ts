import { MochiError } from "@server/errors/mochi.error";
import { UserService } from "@server/services/user.service";
import type { FieldProcessor } from "shared/types";
import type { ITask } from "shared/types/task";

export default class ReviewProcessor implements FieldProcessor {
  fieldName = "review";
  private userService = new UserService();

  async process(_entity: any, task: ITask, _projectId: string): Promise<void> {
    const user = await this.userService.getUser();
    if (!user) {
      throw new MochiError("User not found");
    }

    if (task.reviewer_id === user.gitlabId) {
      task.type = "review";
      task.status = "inprogress";
    }
  }

  shouldProcess(entity: any): boolean {
    return entity.type === "merge_request";
  }
}
