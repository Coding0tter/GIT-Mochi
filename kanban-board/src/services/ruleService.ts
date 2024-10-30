import axios from "axios";
import { addNotification } from "./notificationService";
import { Emitter, Listener, Rule, setRuleStore } from "../stores/ruleStore";

export const fetchListeners = async (): Promise<Listener[]> => {
  return fetchType("listeners");
};

export const fetchEmitters = async (): Promise<Emitter[]> => {
  return fetchType("emitters");
};

export const createRuleAsync = async (rule: Rule) => {
  const res = await axios.post("/rules", rule);
  const response = res.data;

  if (response.error) {
    addNotification({
      title: "Error",
      description: response.error,
      type: "error",
      duration: 5000,
    });
    return;
  }

  addNotification({
    title: "Success",
    description: "Rule created successfully",
    type: "success",
  });
};

const fetchType = async (type: "listeners" | "emitters") => {
  const res = await axios.get(`/rules/${type}`);
  const response = res.data;

  if (response.error) {
    addNotification({
      title: "Error",
      description: response.error,
      type: "error",
      duration: 5000,
    });

    setRuleStore(type, []);
    return [];
  }

  setRuleStore(type, response);
  return response;
};
