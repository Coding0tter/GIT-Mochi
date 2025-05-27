import { model, Schema } from "mongoose";

export interface IEvent extends Document {
  eventType: string;
  timestamp: Date;
  data: Record<string, any>;
}

const EventSchema = new Schema({
  eventType: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  data: Schema.Types.Mixed,
});

export const Event = model<IEvent>("Event", EventSchema);
