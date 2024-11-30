// utils/taskUtils.ts

import type { ITask } from "../models/task";

export function createTaskData(
  entity: any,
  entityType: "merge_request" | "issue"
): Partial<ITask> {
  return {
    labels: entity.labels,
    milestoneId: entity.milestone?.id,
    branch: entity.source_branch,
    projectId: entity.project_id,
    gitlabId: entity.id,
    gitlabIid: entity.iid,
    web_url: entity.web_url,
    type: entityType,
    title: entity.title,
    description: entity.description,
    status: entity.state || "opened",
    custom: false,
  };
}

export function detectChanges(
  existingTask: ITask,
  taskData: Partial<ITask>
): boolean {
  for (const key of Object.keys(taskData)) {
    if (taskData[key as keyof ITask] !== existingTask[key as keyof ITask]) {
      return true;
    }
  }
  return false;
}
