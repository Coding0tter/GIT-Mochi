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

export function parseComments(comments: any[], projectId: string): any[] {
  return comments
    .filter(
      (comment) => !comment.system && comment.author.username !== "merge_train"
    )
    .map((comment) => {
      const imageRegex = /!\[.*?\]\((.*?)\)/g;
      const matches = [...comment.body.matchAll(imageRegex)];
      const images = matches.map(
        (match) => `${process.env.GIT_URL}/-/project/${projectId}` + match[1]
      );

      comment.body = comment.body.replace(imageRegex, "").trim();
      comment.images = images;
      comment.originalId = comment.id;

      return comment;
    });
}
