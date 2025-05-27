import { Task } from "@server/models/task.model";
import type { ITask } from "shared/types/task";
import BaseRepo from "./base.repo";

export class TaskRepo extends BaseRepo<ITask> {
  constructor() {
    super(Task);
  }
}
