import { openCreateModal } from "../services/modalService";
import { Command } from "../stores/commandStore";
import { registerCommand } from "./commandRegistry";

export const execute = async (_command: Partial<Command>) => {
  openCreateModal();
};

registerCommand({
  text: "createTask",
  description: "Create task",
  action: "openCreateTask",
  display: true,
  execute,
});
