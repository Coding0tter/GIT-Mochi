import { Document } from "mongoose";

export interface ITask extends Document<string> {
  gitlabIid?: number;
  gitlabId?: number;
  web_url?: string;
  title: string;
  description?: string;
  milestoneId?: number;
  milestoneName?: string;
  labels?: string[];
  branch?: string;
  status?: string;
  assignee?: IAuthor;
  type?: string;
  custom?: boolean;
  deleted?: boolean;
  order?: number;
  comments: IComment[];
  draft: boolean;
  discussions?: IDiscussion[];
  projectId?: string;
  latestPipelineId?: number;
  pipelineStatus?: string;
  pipelineReports?: IPipelineReport[];
  relevantDiscussionCount?: number;
}

export interface IComment {
  originalId?: number;
  body: string;
  images?: string[];
  resolved: boolean;
  author: {
    name: string;
    username: string;
    avatar_url: string;
  };
  created_at?: string;
  system: boolean;
}

export interface IDiscussion extends Document<string> {
  taskId: string;
  discussionId: string;
  individual_note: boolean;
  notes?: INote[];
}

export interface IAuthor {
  authorId: number;
  name: string;
  username: string;
  avatar_url: string;
}

export interface INote {
  noteId: string;
  type: string;
  body: string;
  author: IAuthor;
  created_at: string;
  system: boolean;
  resolvable: boolean;
  resolved: boolean;
  resolved_by: IAuthor;
  resolved_at: string;
}

export interface IPipelineReport {
  name: string;
  classname: string;
  attachment_url: string;
}
