import type { ITask } from "@shared/types/task";
import { Schema, model } from "mongoose";

const TaskSchema = new Schema<ITask>({
  gitlabIid: { type: Number, unique: false },
  gitlabId: { type: Number, unique: true, sparse: true },
  web_url: String,
  title: { type: String, required: true },
  description: String,
  milestoneId: Number,
  milestoneName: String,
  labels: [String],
  branch: String,
  status: String,
  type: String,
  projectId: String,
  custom: { type: Boolean, default: false },
  deleted: { type: Boolean, default: false },
  order: Number,
  comments: [
    {
      originalId: Number,
      body: { type: String, required: true },
      images: [String],
      resolved: { type: Boolean, default: false },
      author: {
        name: { type: String, required: true },
        username: { type: String, required: true },
        avatar_url: { type: String, required: true },
      },
      system: { type: Boolean, default: false },
      created_at: String,
    },
  ],
  discussions: [
    {
      discussionId: String,
      individual_note: Boolean,
      notes: [
        {
          noteId: String,
          type: { type: String, default: "Discussion" },
          body: String,
          author: {
            authorId: String,
            name: String,
            username: String,
            avatar_url: String,
          },
          created_at: String,
          system: Boolean,
          resolvable: Boolean,
          resolved: { type: Boolean, default: false },
          resolved_by: {
            type: {
              authorId: String,
              name: String,
              username: String,
              avatar_url: String,
            },
            default: null,
          },
          resolved_at: { type: String, default: null },
        },
      ],
    },
  ],
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
