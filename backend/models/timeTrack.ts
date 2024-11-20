import { model, Schema, type Document } from "mongoose";

export interface ITimeTrackEntry extends Document {
  start: Date;
  end: Date;
  break: number;
}

const TimeTrackSchema = new Schema<ITimeTrackEntry>({
  start: { type: Date, required: true },
  end: { type: Date, required: false },
  break: { type: Number, required: false },
})

export const TimeTrack = model<ITimeTrackEntry>("TimeTrack", TimeTrackSchema); 
