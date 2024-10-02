import { Schema, model, Document } from "mongoose";

export interface ITask extends Document {
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
  type?: string;
  custom?: boolean;
  deleted?: boolean;
  comments: Array<{
    body: string;
    images?: string[];
    resolved: boolean;
    author: {
      name: string;
      username: string;
    };
    system: boolean;
  }>;
  projectId?: string;
}

const TaskSchema = new Schema<ITask>({
  gitlabIid: { type: Number, unique: false, sparse: true },
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
  comments: [
    {
      body: { type: String, required: true },
      images: [String],
      resolved: { type: Boolean, default: false },
      author: {
        name: { type: String, required: true },
        username: { type: String, required: true },
      },
      system: { type: Boolean, default: false },
    },
  ],
});

export const Task = model<ITask>("Task", TaskSchema);
