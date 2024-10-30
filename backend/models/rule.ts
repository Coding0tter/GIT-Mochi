import { model, Schema, Document } from "mongoose";

// Define Condition interface and schema
export interface ICondition {
  fieldPath: string;
  operator: "==" | "!=" | ">" | "<";
  value: any;
}

const ConditionSchema = new Schema({
  fieldPath: { type: String, required: true },
  operator: { type: String, enum: ["==", "!=", ">", "<"], required: true },
  value: { type: Schema.Types.Mixed, required: true },
});

// Define Action interface and schema
export interface IAction {
  targetPath: string;
  value: any;
}

const ActionSchema = new Schema({
  targetPath: { type: String, required: true },
  value: { type: Schema.Types.Mixed, required: false },
});

// Define Rule interface and schema
export interface IRule extends Document {
  name: string;
  eventType: string;
  conditions?: ICondition[];
  actions: IAction[];
  enabled: boolean;
}

const RuleSchema = new Schema<IRule>({
  name: { type: String, required: true },
  eventType: { type: String, required: true },
  conditions: [ConditionSchema],
  actions: [ActionSchema],
  enabled: { type: Boolean, default: true },
});

// Export Rule model
export const Rule = model<IRule>("Rule", RuleSchema);
