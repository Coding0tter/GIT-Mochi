import {
  createMergeRequestAndBranchForSelectedTaskAsync,
  openSelectedTaskLink,
  syncGitlabAsync,
} from "../services/gitlabService";
import {
  openCreateModal,
  openDeleteModal,
  openDetailsModal,
  openEditTaskModal,
  openPipelineModal,
} from "../services/modalService";
import {
  addToSelection,
  Direction,
  moveSelection,
  moveSelectionToBottom,
  moveSelectionToTop,
} from "../services/taskNavigationService";
import {
  moveSelectedTasksAsync,
  moveSelectedTasksToEndAsync,
  restoreSelectedTaskAsync,
} from "../services/taskService";
import { toggleShowDeletedTasksAsync } from "../stores/taskStore";
import ShortcutRegistry from "./shortcutRegistry";
import { KeyboardShortcutMap, KeyboardShortcutCategory } from "./types";

const shortcuts: KeyboardShortcutMap = {
  key: "kanban",
  shortcuts: [
    {
      key: ["k", "ArrowUp"],
      action: () => moveSelection(Direction.Up),
      category: KeyboardShortcutCategory.Navigation,
      description: "Move selection up",
    },
    {
      key: ["j", "ArrowDown"],
      action: () => moveSelection(Direction.Down),
      category: KeyboardShortcutCategory.Navigation,
      description: "Move selection down",
    },
    {
      key: ["h", "ArrowLeft"],
      action: () => moveSelection(Direction.Left),
      category: KeyboardShortcutCategory.Navigation,
      description: "Move selection left",
    },
    {
      key: ["l", "ArrowRight"],
      action: () => moveSelection(Direction.Right),
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
      action: () => openDetailsModal(),
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
      action: async () => await syncGitlabAsync(),
      category: KeyboardShortcutCategory.GitlabAction,
      description: "Sync with GitLab",
    },
    {
      shiftKey: true,
      key: "O",
      action: () => openSelectedTaskLink(),
      category: KeyboardShortcutCategory.GitlabAction,
      description: "Open selected task in GitLab",
    },
    {
      shiftKey: true,
      key: "M",
      action: async () =>
        await createMergeRequestAndBranchForSelectedTaskAsync(),
      category: KeyboardShortcutCategory.GitlabAction,
      description: "Create merge request for selected task",
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
  ],
};

ShortcutRegistry.getInstance().registerShortcut(shortcuts);
