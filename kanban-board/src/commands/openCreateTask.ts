import { openCreateModal } from "../services/modalService";
import { resetCommandline } from "../stores/commandStore";
import { registerCommand } from "./commandRegistry";

export const execute = async () => {
  openCreateModal();

  resetCommandline();
};

registerCommand({
  text: "createTask",
  description: "Create task",
  action: "openCreateTask",
  display: true,
  execute,
});
