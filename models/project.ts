import { Schema, model, Document } from "mongoose";

export interface IProject extends Document {
  name: string;
  deleted: boolean;
}

const ProjectSchema = new Schema<IProject>({
  name: { type: String, unique: true },
  deleted: { type: Boolean, default: false },
});

export const Project = model<IProject>("Project", ProjectSchema);
