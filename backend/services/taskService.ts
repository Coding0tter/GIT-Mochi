import type { ITask } from "../models/task";
import { TaskRepo } from "../repositories/taskRepo";
import { MochiError } from "../errors/mochiError";
import { BaseService } from "./baseService";
import { MochiResult } from "../utils/mochiResult";

class TaskService extends BaseService<ITask> {
  constructor() {
    super(new TaskRepo(), "Task");
  }

  async getTasksAsync(projectId: string, showDeleted: boolean) {
    if (!projectId) {
      throw new MochiError("No project selected", 404);
    }

    const tasks = await super.getAllAsync({
      projectId,
    });

    return showDeleted ? tasks : tasks.filter((task) => !task.deleted);
  }

  async moveTaskAsync(taskId: string, status: string) {
    const updatedTask = await super.updateAsync(taskId, { status });
    if (!updatedTask) {
      throw new MochiError("Task not found", 404);
    }
    return updatedTask;
  }

  async updateTaskOrderAsync(tasks: string[]) {
    const updatePromises = tasks.map((taskId, index) => {
      return super.updateAsync(taskId, { order: index });
    });

    await Promise.all(updatePromises);
  }

  async updateTaskAsync(id: string, task: Partial<ITask>) {
    const updatedTask = await super.updateAsync(id, task);

    if (!updatedTask) {
      throw new MochiError("Task not found", 404);
    }

    return new MochiResult(updatedTask);
  }

  async restoreTaskAsync(id: string) {
    const restoredTask = await super.updateAsync(id, {
      deleted: false,
    });
    if (!restoredTask) {
      throw new MochiError("Task not found", 404);
    }
    return restoredTask;
  }

  async setDeletedAsync(id: string) {
    const deletedTask = await super.updateAsync(id, {
      deleted: true,
    });
    if (!deletedTask) {
      throw new MochiError("Task not found", 404);
    }
    return deletedTask;
  }
}

export { TaskService };
export default TaskService;
