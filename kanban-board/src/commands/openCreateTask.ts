import { openCreateModal } from "../services/modalService";
import { resetCommandline } from "../stores/commandStore";
import { registerCommand } from "./commandRegistry";

export const execute = async () => {
  openCreateModal();

  resetCommandline();
};

registerCommand({
  text: "create task",
  description: "Open the create task modal",
  action: "openCreateTask",
  display: true,
  execute,
});
