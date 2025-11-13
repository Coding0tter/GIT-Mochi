import { GitlabClient } from "@server/clients/gitlab.v2.client.ts";
import { MochiError } from "@server/errors/mochi.error.ts";
import { TaskServiceV2 } from "@server/services/task.service.v2.ts";

export class ReviewService {
  private _gitlabClient: GitlabClient;
  private _taskService: TaskServiceV2;

  constructor() {
    this._gitlabClient = new GitlabClient();
    this._taskService = new TaskServiceV2();
  }

  startReview = async (taskId: number, assignee_ids: number[]) => {
    const task = await this._taskService.getTaskById(taskId);

    if (!task) throw new MochiError("Task not found", 404);
  };
}
