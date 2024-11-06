import { ruleAction } from "../../decorators/ruleActionDecorator";
import { MochiError } from "../../errors/mochiError";
import { EventNamespaces, ActionTypes } from "../../events/eventTypes";
import type { ITask } from "../../models/task";
import { logError } from "../../utils/logger";
import type { MochiResult } from "../../utils/mochiResult";
import TaskService from "../taskService";

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
    console.log(data);
    try {
      await this._service.restoreTaskAsync(data.data._id as string);
    } catch (error: any) {
      logError(new MochiError("Error in restoreTaskAsync", 500, error));
      throw error;
    }
  }
}

export default TaskActionHandler;