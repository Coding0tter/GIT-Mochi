import { useNavigate } from "@solidjs/router";
import { registerCommand } from "../commandRegistry";
import type { CommandPipeline } from "../types";

const openSettingsCommand: CommandPipeline = {
  name: "settings",
  description: "Open settings page",
  steps: [
    {
      prompt: "Going to settings...",
      executeAsync: async ({ next }) => {
        window.location.href = "/settings";
        next();
      },
    },
  ],
};

registerCommand(openSettingsCommand);
