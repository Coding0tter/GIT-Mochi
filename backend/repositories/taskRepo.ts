import BaseRepo from "./baseRepo";
import { Task, type ITask } from "../models/task.js";

export class TaskRepo extends BaseRepo<ITask> {
  constructor() {
    super(Task);
  }
}
