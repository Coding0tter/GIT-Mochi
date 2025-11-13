import { copyBranch } from "@client/features/kanban/services/task.service.ts";
import { sync } from "@client/shared/services/gitlab.service.ts";
import {
  handleOpenDetailModal,
  openIssueExternally,
  openMergeRequestExternally,
  openPipelineModal,
} from "@client/shared/services/keyboard-navigation.service.ts";
import { moveKeyboardSelection } from "@client/shared/stores/keyboard-navigation.store.ts";
import {
  openCreateModal,
  openDeleteModal,
  openEditTaskModal,
} from "../services/modalService";
import {
  addToSelection,
  Direction,
  moveSelectionToBottom,
  moveSelectionToTop,
} from "../services/taskNavigationService";
import {
  debugLogTask,
  moveSelectedTasksAsync,
  moveSelectedTasksToEndAsync,
  restoreSelectedTaskAsync,
} from "../services/taskService";
import { toggleShowDeletedTasksAsync } from "../stores/taskStore";
import ShortcutRegistry from "./shortcutRegistry";
import { type KeyboardShortcutMap, KeyboardShortcutCategory } from "./types";

console.log("Registering Kanban shortcuts");
const shortcuts: KeyboardShortcutMap = {
  key: ["kanban", "app/kanban"],
  shortcuts: [
    {
      key: ["k", "ArrowUp"],
      action: () => moveKeyboardSelection(Direction.Up),
      category: KeyboardShortcutCategory.Navigation,
      description: "Move selection up",
    },
    {
      key: ["j", "ArrowDown"],
      action: () => moveKeyboardSelection(Direction.Down),
      category: KeyboardShortcutCategory.Navigation,
      description: "Move selection down",
    },
    {
      key: ["h", "ArrowLeft"],
      action: () => moveKeyboardSelection(Direction.Left),
      category: KeyboardShortcutCategory.Navigation,
      description: "Move selection left",
    },
    {
      key: ["l", "ArrowRight"],
      action: () => moveKeyboardSelection(Direction.Right),
      category: KeyboardShortcutCategory.Navigation,
      description: "Move selection right",
    },
    {
      key: "d",
      action: () => openDeleteModal(),
      category: KeyboardShortcutCategory.TaskManagement,
      description: "Delete selected tasks",
    },
    {
      key: ["c", "n"],
      action: () => openCreateModal(),
      category: KeyboardShortcutCategory.TaskManagement,
      description: "Create new task",
    },
    {
      key: "e",
      action: () => openEditTaskModal(),
      category: KeyboardShortcutCategory.TaskManagement,
      description: "Edit selected task",
    },
    {
      key: "o",
      action: () => handleOpenDetailModal(),
      category: KeyboardShortcutCategory.TaskManagement,
      description: "Open details of selected task",
    },
    {
      key: "p",
      action: () => openPipelineModal(),
      category: KeyboardShortcutCategory.TaskManagement,
      description: "Open pipeline modal",
    },
    {
      key: "t",
      action: async () => await toggleShowDeletedTasksAsync(),
      category: KeyboardShortcutCategory.TaskManagement,
      description: "Toggle show deleted tasks",
    },
    {
      key: "g",
      action: () => moveSelectionToTop(),
      category: KeyboardShortcutCategory.Navigation,
      description: "Move selection to top",
    },
    {
      key: "b",
      action: () => copyBranch(),
      category: KeyboardShortcutCategory.Navigation,
      description: "Copy branch name to clipboard",
    },

    {
      shiftKey: true,
      key: ["H", "ArrowLeft"],
      action: async () => await moveSelectedTasksAsync(Direction.Left),
      category: KeyboardShortcutCategory.Navigation,
      description: "Move selected tasks left",
    },
    {
      shiftKey: true,
      key: ["L", "ArrowRight"],
      action: async () => await moveSelectedTasksAsync(Direction.Right),
      category: KeyboardShortcutCategory.Navigation,
      description: "Move selected tasks right",
    },
    {
      shiftKey: true,
      key: ["K", "ArrowUp"],
      action: () => addToSelection(Direction.Up),
      category: KeyboardShortcutCategory.Navigation,
      description: "Add to selection above",
    },
    {
      shiftKey: true,
      key: ["J", "ArrowDown"],
      action: () => addToSelection(Direction.Down),
      category: KeyboardShortcutCategory.Navigation,
      description: "Add to selection below",
    },
    {
      shiftKey: true,
      key: "S",
      action: async () => await sync(),
      category: KeyboardShortcutCategory.GitlabAction,
      description: "Sync with GitLab",
    },
    {
      shiftKey: true,
      key: "O",
      action: () => openIssueExternally(),
      category: KeyboardShortcutCategory.GitlabAction,
      description: "Open selected issue in GitLab",
    },
    {
      shiftKey: true,
      key: "M",
      action: () => openMergeRequestExternally(),
      category: KeyboardShortcutCategory.GitlabAction,
      description: "Open selected merge_request in GitLab",
    },
    {
      shiftKey: true,
      key: "R",
      action: async () => await restoreSelectedTaskAsync(),
      category: KeyboardShortcutCategory.TaskManagement,
      description: "Restore selected task",
    },
    {
      shiftKey: true,
      key: ["^"],
      action: async () => await moveSelectedTasksToEndAsync(Direction.Up),
      category: KeyboardShortcutCategory.Navigation,
      description: "Move selected tasks to top",
    },
    {
      shiftKey: true,
      key: ["$"],
      action: async () => await moveSelectedTasksToEndAsync(Direction.Down),
      category: KeyboardShortcutCategory.Navigation,
      description: "Move selected tasks to bottom",
    },
    {
      shiftKey: true,
      key: "G",
      action: () => moveSelectionToBottom(),
      category: KeyboardShortcutCategory.Navigation,
      description: "Move selection to bottom",
    },

    {
      ctrlKey: true,
      key: ["k", "ArrowUp"],
      action: async () => await moveSelectedTasksAsync(Direction.Up),
      category: KeyboardShortcutCategory.Navigation,
      description: "Move selected tasks up",
    },
    {
      ctrlKey: true,
      key: ["j", "ArrowDown"],
      action: async () => await moveSelectedTasksAsync(Direction.Down),
      category: KeyboardShortcutCategory.Navigation,
      description: "Move selected tasks down",
    },
    {
      ctrlKey: true,
      key: "d",
      action: () => debugLogTask(),
      category: KeyboardShortcutCategory.TaskManagement,
      description: "Debug log task",
    },
  ],
};

ShortcutRegistry.getInstance().registerShortcut(shortcuts);
