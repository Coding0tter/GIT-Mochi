import { MochiError } from "@server/errors/mochi.error.ts";
import { TaskRepoV2 } from "@server/repositories/task.repo.v2.ts";
import { GitlabServiceV2 } from "@server/services/gitlab.service.v2.ts";
import { SettingService } from "@server/services/setting.service.v2.ts";
import SocketHandler from "@server/sockets/index.ts";
import type { ObjectId } from "mongoose";
import { SettingKeys } from "shared";
import type { GitlabLabel } from "shared/types/gitlab/label.ts";
import type { GitlabMergeRequest } from "shared/types/gitlab/merge_request.ts";

export class TaskServiceV2 {
  private _taskRepo: TaskRepoV2;
  private _gitlabService: GitlabServiceV2;
  private _settingService: SettingService;

  constructor() {
    this._taskRepo = new TaskRepoV2();
    this._gitlabService = new GitlabServiceV2();
    this._settingService = new SettingService();
  }

  async getAll(deleted: boolean = false) {
    return await this._taskRepo.getAll(deleted);
  }

  async getTaskById(taskId: number) {
    return await this._taskRepo.getById(taskId);
  }

  async getTasksForUser(userId: number) {
    return await this._taskRepo.getTasksForUser(userId);
  }

  async markAsRead(taskId: number) {
    const task = await this._taskRepo.markAsRead(taskId);

    SocketHandler.getInstance()
      .getIO()
      .emit("tasks.changed", [{ ...task, notify: false }]);
  }

  async updateStatus(userId: ObjectId, taskId: number, status: string) {
    const { oldStatus, newStatus, task } = await this._taskRepo.updateStatus(
      taskId,
      status,
    );

    if (!oldStatus || !newStatus || !task) {
      throw new MochiError("Task not found or status unchanged");
    }

    const syncLabels = await this._settingService.getUserSettingByKey<boolean>(
      userId,
      SettingKeys.SYNC_LABELS,
    );

    if (syncLabels) {
      const columnLabels = await this._settingService.getSettingByKey<
        Record<string, GitlabLabel>
      >(SettingKeys.COLUMN_LABELS);

      const oldLabel = columnLabels ? columnLabels[oldStatus] : null;
      const newLabel = columnLabels ? columnLabels[newStatus] : null;

      if (!!oldLabel) {
        task.labels = task.labels.filter((label: string) =>
          oldLabel && label === oldLabel.name ? false : true,
        );
      }

      if (!!newLabel) {
        task.labels.push(newLabel!.name);
      }

      await Promise.all([
        // await this._gitlabService.syncLabels(task.iid, task.labels, "issues"),
        ...task.merge_requests.map(async (mr: GitlabMergeRequest) => {
          if (!!oldLabel) {
            mr.labels = task.labels.filter((label: string) =>
              oldLabel && label === oldLabel.name ? false : true,
            );
          }

          if (!!newLabel) {
            mr.labels.push(newLabel!.name);
          }

          // await this._gitlabService.syncLabels(
          //   mr.iid,
          //   mr.labels,
          //   "merge_requests",
          // );
        }),
      ]);
    }

    await task.save();

    SocketHandler.getInstance().getIO().emit("tasks.changed", [task]);
  }
}
