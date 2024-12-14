import { Task } from "@server/models/task";
import type { ITask } from "shared/types/task";
import BaseRepo from "./baseRepo";

export class TaskRepo extends BaseRepo<ITask> {
  constructor() {
    super(Task);
  }
}
