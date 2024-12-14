import axios from "axios";
import { addNotification } from "./notificationService";
import {
  type Emitter,
  type Listener,
  type Rule,
  setRuleStore,
} from "../stores/ruleStore";

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

export const fetchRules = async () => {
  const res = await axios.get("/rules");
  const response = res.data;

  if (response.error) {
    addNotification({
      title: "Error",
      description: response.error,
      type: "error",
      duration: 5000,
    });

    setRuleStore("rules", []);
    return;
  }

  setRuleStore("rules", response);
  return response;
};

export const deleteRuleAsync = async (id: string) => {
  const res = await axios.delete(`/rules/${id}`);
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
    description: "Rule deleted successfully",
    type: "success",
  });
};

export const toggleRuleAsync = async (id: string) => {
  const res = await axios.put(`/rules/toggle/${id}`);
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
    description: "Rule toggled successfully",
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
