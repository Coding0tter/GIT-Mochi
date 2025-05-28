import { modalStore, ModalType } from "@client/stores/modalStore";
import {
  toggleResolvedDiscussions,
  toggleSystemDiscussions,
} from "@client/components/modals/TaskDetailsModal/task-details-modal.store";
import ShortcutRegistry from "./shortcutRegistry";
import { type KeyboardShortcutMap, KeyboardShortcutCategory } from "./types";

const shortcuts: KeyboardShortcutMap = {
  key: ModalType.TaskDetails,
  shortcuts: [
    {
      key: "s",
      action: () => toggleSystemDiscussions(),
      category: KeyboardShortcutCategory.TaskDetails,
      description: "Toggles system notes",
    },
    {
      key: "t",
      action: () => toggleResolvedDiscussions(),
      category: KeyboardShortcutCategory.TaskDetails,
      description: "Toggles resolved discussions",
    },
    {
      key: "O",
      shiftKey: true,
      action: () => window.open(modalStore.selectedTask!.web_url, "_blank"),
      category: KeyboardShortcutCategory.TaskDetails,
      description: "Open task in new tab",
    },
  ],
};

ShortcutRegistry.getInstance().registerShortcut(shortcuts);
