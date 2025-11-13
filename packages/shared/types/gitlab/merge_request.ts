import { mapToGitlabPipeline, type GitlabPipeline } from "./pipeline.ts";
import { mapToGitlabUser, type GitlabUser } from "./user.ts";

export interface GitlabMergeRequest {
  id: number;
  iid: number;
  title: string;
  description: string;
  state: string;
  target_branch: string;
  source_branch: string;
  author: GitlabUser;
  assignees: GitlabUser[];
  reviewers: (GitlabUser & { state: string })[];
  labels: string[];
  draft: boolean;
  web_url: string;
  pipeline: GitlabPipeline | null;
  reference: string;
}

export function mapToGitlabMergeRequest(data: any): GitlabMergeRequest {
  return {
    id: data?.id,
    iid: data.iid,
    title: data.title,
    description: data.description,
    state: data.state,
    target_branch: data.target_branch,
    source_branch: data.source_branch,
    author: mapToGitlabUser(data.author),
    assignees: (data.assignees || []).map(mapToGitlabUser),
    reviewers: (data.reviewers || []).map((r: any) => ({
      ...mapToGitlabUser(r?.user || r),
      state: r?.state || "unreviewed",
    })),
    labels: data.labels || [],
    draft: data.work_in_progress || false,
    web_url: data.web_url,
    pipeline: data.pipeline ? mapToGitlabPipeline(data.pipeline) : null,
    reference: data.reference || "",
  };
}
