import { model, Schema } from "mongoose";

export interface ICondition {
  field: string;
  operation: string;
  value: any;
}

export interface IAction {
  actionType: string;
  params: Record<string, any>;
}

export interface IRule extends Document {
  name: string;
  triggerEvent: string;
  conditions: ICondition[];
  actions: IAction[];
  enabled: boolean;
}

const ConditionSchema = new Schema({
  field: String,
  operation: String,
  value: Schema.Types.Mixed,
});

const ActionSchema = new Schema({
  actionType: String,
  params: Schema.Types.Mixed,
});

const RuleSchema = new Schema({
  name: { type: String, required: true },
  triggerEvent: { type: String, required: true },
  conditions: [ConditionSchema],
  actions: [ActionSchema],
  enabled: { type: Boolean, default: true },
});

export const Rule = model<IRule>("Rule", RuleSchema);
