import { model, Schema } from "mongoose";
import type { ITaskV2 } from "shared/types/task.v2.ts";

const TaskV2Schema = new Schema<ITaskV2>({
  id: { type: Number, required: true, unique: true },
  iid: { type: Number, required: true },
  title: { type: String, required: true },
  status: { type: String, required: true },
  merge_requests: { type: Array, default: [] },
  labels: { type: [String], default: [] },
  notify: { type: Boolean, default: true },
});

export const TaskV2 = model<ITaskV2>("TaskV2", TaskV2Schema);
