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

export function deepEqual(a: any, b: any, excludedKeys: string[] = []) {
  // If values are strictly equal, they're equal.
  if (a === b) return true;

  // If either is null/undefined (and they are not strictly equal), they're not equal.
  if (a == null || b == null) return false;

  // If both are primitives (non-objects), check for number-string equivalence.
  if (typeof a !== "object" && typeof b !== "object") {
    // Check if one is a number and the other is a string.
    if (typeof a === "number" && typeof b === "string") {
      if (!isNaN(Number(b)) && a === Number(b)) return true;
    }
    if (typeof a === "string" && typeof b === "number") {
      if (!isNaN(Number(a)) && Number(a) === b) return true;
    }
    return false;
  }

  // Handle arrays.
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i], excludedKeys)) return false;
    }
    return true;
  }

  // If one is an array and the other isn't, they're not equal.
  if (Array.isArray(a) || Array.isArray(b)) return false;

  // Both a and b are objects here.
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  // Determine the keys that are common to both objects.
  let commonKeys = keysA.filter((key) => keysB.includes(key));

  // Exclude keys specified in the excludedKeys parameter.
  commonKeys = commonKeys.filter((key) => !excludedKeys.includes(key));

  // Recursively compare values for each common key.
  for (let key of commonKeys) {
    if (!deepEqual(a[key], b[key], excludedKeys)) return false;
  }

  return true;
}
