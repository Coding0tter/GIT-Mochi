import { MochiError } from "@server/errors/mochi.error.ts";
import { TaskV2 } from "@server/models/task.model.v2.ts";
import { logError, logInfo } from "@server/utils/logger.ts";
import type { ITaskV2 } from "shared/types/index.ts";

export class TaskRepoV2 {
  async getAll(deleted: boolean = false) {
    return await TaskV2.find({ deleted: deleted }).lean();
  }

  async getById(taskId: number) {
    return await TaskV2.findOne({ id: taskId });
  }

  async find(query: Partial<ITaskV2>) {
    return await TaskV2.find(query);
  }

  async getMergeRequests() {
    const tasks = await TaskV2.find({
      merge_requests: { $exists: true, $ne: [] },
    }).lean();

    return tasks.flatMap((task) => task.merge_requests || []);
  }

  async markAsRead(taskId: number) {
    return await TaskV2.findOneAndUpdate(
      { id: taskId },
      { $set: { notify: false } },
    ).lean();
  }

  async getTasksForUser(userId: number) {
    return await TaskV2.find({
      $or: [
        { "assignees.id": userId },
        { "reviewers.id": userId },
        { "merge_requests.assignees.id": userId },
        { "merge_requests.reviewers.id": userId },
      ],
      deleted: false,
    }).lean();
  }

  async updateStatus(
    taskId: number,
    status: string,
  ): Promise<{
    oldStatus: string | null;
    newStatus: string | null;
    task: ITaskV2 | null;
  }> {
    const old = await TaskV2.findOne({ id: taskId }).select("status").lean();
    const task = await TaskV2.findOneAndUpdate(
      { id: taskId },
      { $set: { status } },
      { new: true },
    );

    return {
      oldStatus: old?.status ?? null,
      newStatus: task?.status ?? null,
      task,
    };
  }

  async upsertMany(tasks: ITaskV2[]): Promise<ITaskV2[]> {
    if (!tasks.length) return [];

    const ops = tasks.map((task) => {
      const { status, ...rest } = task as any;

      return {
        updateOne: {
          filter: { iid: task.iid },
          update: {
            $set: rest,
            $setOnInsert: {
              status,
            },
          },
          upsert: true,
        },
      };
    });

    try {
      await TaskV2.collection.bulkWrite(ops, { ordered: false });

      const ids = tasks.map((t) => t.id);
      return await TaskV2.find({ id: { $in: ids } })
        .lean<ITaskV2[]>()
        .exec();
    } catch (error: any) {
      logError(new MochiError(error.message, 500, error));
      return [];
    }
  }

  async softDeleteTasks(ids: Set<number>) {
    console.log(Array.from(ids));
    const res = await TaskV2.collection.updateMany(
      {
        iid: { $in: Array.from(ids) },
        deleted: { $ne: true },
      },
      {
        $set: { deleted: true },
      },
    );

    logInfo(`Soft deleted ${JSON.stringify(res)} tasks.`);
  }
}
