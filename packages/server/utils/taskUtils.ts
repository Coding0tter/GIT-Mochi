import type { ITask } from "shared/types/task";

export function createTaskData(
  entity: any,
  entityType: "merge_request" | "issue",
): Partial<ITask> {
  return {
    labels: entity.labels,
    milestoneId: entity.milestone?.id,
    draft: entity.draft,
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
