import { mapToGitlabUser, type GitlabUser } from "./user.ts";

export interface GitlabIssue {
  id: number;
  iid: number;
  title: string;
  description: string;
  state: string;
  labels: string[];
  assignees: GitlabUser[];
  author: GitlabUser;
  web_url: string;
  milestone_id: string;
}

export function mapToGitlabIssue(data: any): GitlabIssue {
  return {
    id: data?.id,
    iid: data.iid,
    title: data.title,
    description: data.description,
    state: data.state,
    labels: data.labels,
    assignees: (data.assignees || []).map(mapToGitlabUser),
    author: mapToGitlabUser(data.author),
    web_url: data.web_url,
    milestone_id: data.milestone ? data.milestone.id : null,
  };
}
