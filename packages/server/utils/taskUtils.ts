import type { ITask } from "shared/types/task";

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
    const newValue = taskData[key as keyof ITask];
    const existingValue = existingTask[key as keyof ITask];

    if (
      (typeof newValue === "object" || Array.isArray(newValue)) &&
      JSON.stringify(newValue) !== JSON.stringify(existingValue)
    ) {
      return true;
    }

    if (newValue !== existingValue) {
      return true;
    }
  }
  return false;
}
