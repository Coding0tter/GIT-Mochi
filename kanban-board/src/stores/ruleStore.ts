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

export interface Rule {
  name: string;
  eventType: string;
  conditions: Condition[];
  actions: Action[];
  enabled: boolean;
}

interface Condition {
  fieldPath: string;
  operator: "==" | "!=" | ">" | "<";
  value: any;
}

interface Action {
  targetPath: string;
  value: any;
}

export const [ruleStore, setRuleStore] = createStore({
  emitters: [] as Emitter[],
  listeners: [] as Listener[],
  rules: [] as Rule[],
});
