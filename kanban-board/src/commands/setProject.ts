import { addNotification } from "../services/notificationService";
import { closeModalAndUnfocus } from "../services/uiService";
import { getProject, setProject } from "../services/utils";
import { Command, setCurrentCommand } from "../stores/commandStore";
import { handleGitlabSyncAsync } from "../stores/taskStore";
import { setCommandInputValue, setCurrentProject } from "../stores/uiStore";
import { registerCommand } from "./commandRegistry";

export const execute = async (_command: Partial<Command>, value?: string) => {
  try {
    setCurrentCommand(null);
    await setProject(value!);
    await handleGitlabSyncAsync();
    setCurrentProject(await getProject());

    addNotification({
      title: "Success",
      description: "Project set successfully",
      type: "success",
    });

    setCommandInputValue("");
  } catch (error) {
    addNotification({
      title: "Error",
      description: "Failed to set project",
      type: "error",
    });
  } finally {
    closeModalAndUnfocus();
  }
};

registerCommand({
  text: "setProject",
  description: "Set project",
  action: "setProject",
  beforeAction: "loadProjects",
  display: true,
  execute,
});
