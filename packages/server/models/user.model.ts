import type { ISetting } from "@server/models/setting.model.ts";
import { Schema, model, Document } from "mongoose";

export interface IUser extends Document {
  gitlabId: number;
  username: string;
  email: string;
  name: string;
  avatar_url: string;
  gitlabToken: {
    access_token: string;
    expires_in: number;
    refresh_token: string;
    created_at?: number;
  };
  isAdmin: boolean;
  settings: ISetting[];
}

const UserSchema = new Schema<IUser>({
  gitlabId: { type: Number, required: true, unique: true },
  username: { type: String, required: true },
  email: { type: String, required: true },
  name: { type: String },
  avatar_url: { type: String },
  gitlabToken: {
    access_token: String,
    expires_in: Number,
    refresh_token: String,
    created_at: Number,
  },
  settings: [
    {
      key: { type: String, unique: true },
      value: String,
    },
  ],
  isAdmin: { type: Boolean, default: false },
});

export const User = model<IUser>("User", UserSchema);
