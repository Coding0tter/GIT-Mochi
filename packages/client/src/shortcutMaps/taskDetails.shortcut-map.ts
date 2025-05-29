import { modalStore, ModalType } from "@client/stores/modalStore";
import ShortcutRegistry from "./shortcutRegistry";
import { type KeyboardShortcutMap, KeyboardShortcutCategory } from "./types";
import { TaskDetailsModalService } from "@client/components/modals/TaskDetailsModal/task-details-modal.store";
import { Direction } from "@client/services/taskNavigationService";
import { closeTopModal } from "@client/services/modalService";

const shortcuts: KeyboardShortcutMap = {
  key: ModalType.TaskDetails,
  shortcuts: [
    {
      key: ["q", "Escape"],
      action: () => closeTopModal(),
      category: KeyboardShortcutCategory.TaskDetails,
      description: "Close modal",
    },
    {
      key: ["j", "ArrowDown"],
      action: () => TaskDetailsModalService.moveSelection(Direction.Down),
      category: KeyboardShortcutCategory.TaskDetails,
      description: "Move selection down",
    },
    {
      key: ["k", "ArrowUp"],
      action: () => TaskDetailsModalService.moveSelection(Direction.Up),
      category: KeyboardShortcutCategory.TaskDetails,
      description: "Move selection up",
    },
    {
      key: "r",
      action: () => TaskDetailsModalService.reply(),
      category: KeyboardShortcutCategory.TaskDetails,
      description: "Reply to discussion",
    },
    {
      key: "R",
      shiftKey: true,
      action: () => TaskDetailsModalService.resolveThread(),
      category: KeyboardShortcutCategory.TaskDetails,
      description: "Mark discussion as resolved",
    },
    {
      key: "s",
      action: () => TaskDetailsModalService.toggleSystemDiscussions(),
      category: KeyboardShortcutCategory.TaskDetails,
      description: "Toggles system notes",
    },
    {
      key: "t",
      action: () => TaskDetailsModalService.toggleResolvedDiscussions(),
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
