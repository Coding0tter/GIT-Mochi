import type { GitlabUser } from "./user.ts";

export interface GitlabNote {
  id: number;
  type: string;
  body: string;
  author: GitlabUser;
  created_at: string;
  system: boolean;
  resolvable: boolean;
  resolved?: boolean;
  position?: {
    new_path: string;
    new_line: number;
  };
}
