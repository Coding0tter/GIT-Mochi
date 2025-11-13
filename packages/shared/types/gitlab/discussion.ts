import type { GitlabNote } from "./note.ts";

export interface GitlabDiscussion {
  id: string;
  iid: number;
  individual_note: boolean;
  notes: GitlabNote[];
}
