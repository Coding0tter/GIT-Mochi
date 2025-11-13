import type { GitlabUser } from "./user.ts";

export interface GitlabApproval {
  id: number;
  iid: number;
  approved_by: { user: GitlabUser; approved_at: string }[];
}
