import type { ITask } from "../models/task";
import { TaskRepo } from "../repositories/taskRepo";
import { MochiError } from "../errors/mochiError";
import { BaseService } from "./baseService";
import { ActionTypes, EventNamespaces, EventTypes } from "../events/eventTypes";
import { ruleEvent } from "../decorators/ruleEventDecorator";
import { ruleAction } from "../decorators/ruleListenerDecorator";

class TaskService extends BaseService<ITask> {
  constructor() {
    super(new TaskRepo(), "Task");
  }

  @ruleEvent(EventNamespaces.Task, EventTypes.Created)
  async createTaskAsync(projectId: string, task: Partial<ITask>) {
    if (!projectId) {
      throw new MochiError("No project selected", 404);
    }

    task.projectId = projectId;

    return super.createAsync(task as ITask);
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

  @ruleEvent(EventNamespaces.Task, EventTypes.Updated)
  async updateTaskAsync(id: string, task: Partial<ITask>) {
    const updatedTask = await super.updateAsync(id, task);
    if (!updatedTask) {
      throw new MochiError("Task not found", 404);
    }
    return updatedTask;
  }

  @ruleAction(EventNamespaces.Task, ActionTypes.Move, true)
  async moveTaskAsync(id: string, status: string) {
    const updatedTask = await super.updateAsync(id, { status });
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

  async restoreTaskAsync(id: string) {
    const restoredTask = await super.updateAsync(id, {
      deleted: false,
    });
    if (!restoredTask) {
      throw new MochiError("Task not found", 404);
    }
    return restoredTask;
  }

  @ruleAction(EventNamespaces.Task, ActionTypes.Delete)
  async deleteTaskAsync(id: string) {
    const deletedTask = await super.updateAsync(id, {
      deleted: true,
    });
    if (!deletedTask) {
      throw new MochiError("Task not found", 404);
    }
  }
}

export { TaskService };
export default TaskService;
