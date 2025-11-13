import type { GitlabIssue, GitlabMergeRequest } from "./gitlab/index.ts";

export interface ITaskV2 extends GitlabIssue {
  merge_requests?: GitlabMergeRequest[];
  deleted: boolean;
  status: string;
  order: number;
  notify: boolean;
}
