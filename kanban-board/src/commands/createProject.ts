import axios from "axios";
import { Command } from "../stores/commandStore";
import { registerCommand } from "./commandRegistry";

export const execute = async (command: Partial<Command>, value?: string) => {
  const response = await axios.post("/api/projects", { name: value });
  console.log(response.data);
};

registerCommand({
  text: "createProject",
  description: "Create project",
  action: "createProject",
  beforeAction: "getInput",
  display: true,
  execute,
});
