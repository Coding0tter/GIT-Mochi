import { Schema, model, Document } from "mongoose";

// Task interface extends Document for mongoose
export interface IUser extends Document {
  gitlabId: { type: Number; required: true; unique: true };
  username: { type: String; required: true };
  email: { type: String; required: true };
  name: { type: String };
  avatar_url: { type: String };
}

const UserSchema = new Schema<IUser>({
  gitlabId: { type: Number, required: true, unique: true },
  username: { type: String, required: true },
  email: { type: String, required: true },
  name: { type: String },
  avatar_url: { type: String },
});

export const User = model<IUser>("User", UserSchema);
