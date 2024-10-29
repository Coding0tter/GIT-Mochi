import axios from "axios";
import { addNotification } from "./notificationService";
import { Emitter, setRuleStore } from "../stores/ruleStore";

export const fetchListeners = async () => {
  return fetchType("listeners");
};

export const fetchEmitters = async (): Promise<Emitter[]> => {
  return fetchType("emitters");
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
