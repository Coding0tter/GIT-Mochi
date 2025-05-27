import { Schema, model, Document } from "mongoose";

export enum AppStateKey {
  Recording = "recording",
}

export interface IAppStateEntry extends Document {
  key: string;
  value: string;
}

const AppStateSchema = new Schema<IAppStateEntry>({
  key: { type: String, unique: true },
  value: String,
});

export const AppState = model<IAppStateEntry>("AppState", AppStateSchema);
