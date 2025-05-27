import { Schema, model } from "mongoose";
import type { IDiscussion } from "shared/types/task";

const DiscussionSchema = new Schema<IDiscussion>({
  taskId: { type: String, required: true, ref: "Task" },
  discussionId: { type: String, required: true },
  individual_note: { type: Boolean, default: false },
  notes: [
    {
      author: {
        authorId: Number,
        name: String,
        username: String,
        avatar_url: String,
      },
      body: { type: String, required: true },
      created_at: { type: String, required: true },
      noteId: { type: String, required: true },
      resolvable: { type: Boolean, default: false },
      resolved: { type: Boolean, default: false },
      resolved_at: { type: String, default: null },
      resolved_by: {
        authorId: Number,
        name: String,
        username: String,
        avatar_url: String,
      },
      system: { type: Boolean, default: false },
    },
  ],
});

export const Discussion = model<IDiscussion>("Discussion", DiscussionSchema);
