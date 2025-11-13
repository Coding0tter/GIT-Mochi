import { Task } from "@server/models/task.model";
import type { ITask } from "shared/types/task.ts";
import BaseRepo from "./base.repo";

export class TaskRepo extends BaseRepo<ITask> {
  constructor() {
    super(Task);
  }

  findAll(deleted: boolean = false) {
    return this.model.find({ deleted }).toArray();
  }
}
