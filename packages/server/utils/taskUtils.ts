import type { ITask } from "shared/types/task";

export function createTaskData(
  entity: any,
  entityType: "merge_request" | "issue",
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
    assignee: { authorId: entity?.assignee?.id ?? "-1", ...entity.assignee },
  };
}

export function detectChanges(
  existingTask: ITask,
  taskData: Partial<ITask>,
): boolean {
  for (const key in taskData) {
    const newValue = taskData[key as keyof ITask];
    const existingValue = existingTask[key as keyof ITask];

    if (!deepEqual(existingValue, newValue)) {
      return true;
    }
  }
  return false;
}

function deepEqual(a: any, b: any): boolean {
  if (a === b) return true;

  // Handle cases where one is null/undefined
  if (a == null || b == null) return a === b;

  // Check that types match
  if (typeof a !== typeof b) return false;

  // For arrays, check lengths and each item.
  if (Array.isArray(a)) {
    if (!Array.isArray(b) || a.length !== b.length) return false;
    return a.every((item, index) => deepEqual(item, b[index]));
  }

  // For objects, compare keys and values recursively.
  if (typeof a === "object") {
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);
    if (aKeys.length !== bKeys.length) return false;
    return aKeys.every((key) => deepEqual(a[key], b[key]));
  }

  // Fallback for primitives.
  return false;
}
