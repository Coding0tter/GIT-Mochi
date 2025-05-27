import { Schema, model } from "mongoose";
import type { ITask } from "shared/types/task";

const TaskSchema = new Schema<ITask>({
  gitlabIid: { type: Number, unique: false },
  gitlabId: { type: Number, unique: true, sparse: true },
  web_url: String,
  title: { type: String, required: true },
  description: String,
  draft: Boolean,
  milestoneId: Number,
  milestoneName: String,
  assignee: {
    authorId: Number,
    name: String,
    username: String,
    avatar_url: String,
  },
  labels: [String],
  branch: String,
  status: String,
  type: String,
  relevantDiscussionCount: { type: Number, default: 0 },
  projectId: String,
  custom: { type: Boolean, default: false },
  deleted: { type: Boolean, default: false },
  order: Number,
  latestPipelineId: Number,
  pipelineStatus: String,
  pipelineReports: [
    {
      name: String,
      classname: String,
      attachment_url: String,
    },
  ],
});

export const Task = model<ITask>("Task", TaskSchema);
