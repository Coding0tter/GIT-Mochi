import { Schema, model, Document } from "mongoose";

export interface ISetting extends Document {
  key: string;
  value: string;
}

const SettingSchema = new Schema<ISetting>({
  key: { type: String, unique: true },
  value: String,
});

export const Setting = model<ISetting>("Setting", SettingSchema);
