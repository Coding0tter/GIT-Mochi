import { ruleAction } from "@server/decorators/ruleAction.decorator";
import { MochiError } from "@server/errors/mochi.error";
import { EventNamespaces, ActionTypes } from "@server/events/eventTypes";
import TaskService from "@server/services/task.service";
import { logError } from "@server/utils/logger";
import { MochiResult } from "@server/utils/mochiResult";
import type { ITask } from "shared/types/task";

class TaskActionHandler {
  private _service: TaskService;

  constructor() {
    this._service = new TaskService();
  }

  @ruleAction({
    eventNamespace: EventNamespaces.Task,
    eventName: ActionTypes.Move,
    hasParams: true,
  })
  async moveTaskAsync(data: MochiResult, eventData: any) {
    try {
      const { _id } = data.data as ITask;
      const status = eventData;

      await this._service.moveTaskAsync(_id as string, status);
    } catch (error: any) {
      logError(new MochiError("Error in moveTaskAsync", 500, error));
      throw error;
    }
  }

  @ruleAction({
    eventNamespace: EventNamespaces.Task,
    eventName: ActionTypes.Delete,
  })
  async deleteTaskAsync(data: MochiResult) {
    try {
      await this._service.setDeletedAsync(data.data._id as string);
    } catch (error: any) {
      logError(new MochiError("Error in deleteTaskAsync", 500, error));
      throw error;
    }
  }

  @ruleAction({
    eventNamespace: EventNamespaces.Task,
    eventName: ActionTypes.Restore,
  })
  async restoreTaskAsync(data: MochiResult) {
    try {
      await this._service.restoreTaskAsync(data.data._id as string);
    } catch (error: any) {
      logError(new MochiError("Error in restoreTaskAsync", 500, error));
      throw error;
    }
  }
}

export default TaskActionHandler;
