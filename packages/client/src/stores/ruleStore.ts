import { createStore } from "solid-js/store";

export interface Emitter {
  className: string;
  eventNamespace: string;
  eventType: string;
  methodName: string;
}

export interface Listener {
  className: string;
  eventNamespace: string;
  eventType: string;
  methodName: string;
  hasParams: boolean;
}

export type Rule = {
  _id: string;
  name: string;
  eventType: string;
  conditions: Condition[];
  actions: Action[];
  enabled: boolean;
};

export type Condition = {
  fieldPath: string;
  operator: "==" | "!=" | ">" | "<";
  value: any;
};

export type Action = {
  targetPath: string;
  value: any;
};

export const [ruleStore, setRuleStore] = createStore({
  emitters: [] as Emitter[],
  listeners: [] as Listener[],
  rules: [] as Rule[],
});
