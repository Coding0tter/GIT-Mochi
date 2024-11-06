import { ruleEvent } from "../../decorators/ruleEventDecorator";
import { MochiError } from "../../errors/mochiError";
import { EventNamespaces, EventTypes } from "../../events/eventTypes";
import type { ITask } from "../../models/task";
import { MochiResult } from "../../utils/mochiResult";
import TaskService from "../taskService";

class TaskEventEmitter extends TaskService {
  constructor() {
    super();
  }

  @ruleEvent(EventNamespaces.Task, EventTypes.Created)
  async createTaskAsync(projectId: string, task: Partial<ITask>) {
    try {
      if (!projectId) {
        throw new MochiError("No project selected", 404);
      }

      task.projectId = projectId;

      const createdTask = await super.createAsync(task as ITask);
      return new MochiResult(createdTask);
    } catch (error: any) {
      return new MochiResult(null, error);
    }
  }

  @ruleEvent(EventNamespaces.Task, EventTypes.Updated)
  async updateTaskAsync(id: string, task: Partial<ITask>) {
    try {
      const updatedTask = await super.updateAsync(id, task);

      if (!updatedTask) {
        throw new MochiError("Task not found", 404);
      }

      return new MochiResult(updatedTask);
    } catch (error: any) {
      return new MochiResult(null, error);
    }
  }

  @ruleEvent(EventNamespaces.Task, EventTypes.Deleted)
  async deleteTaskAsync(id: string) {
    try {
      const deletedTask = await super.setDeletedAsync(id);
      if (!deletedTask) {
        throw new MochiError("Task not found", 404);
      }

      return new MochiResult(deletedTask);
    } catch (error: any) {
      return new MochiResult(null, error);
    }
  }
}

export default TaskEventEmitter;
