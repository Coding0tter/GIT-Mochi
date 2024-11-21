import { KeyboardShortcutMap } from ".";
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
} from "../services/modalService";
import {
  addToSelection,
  Direction,
  moveSelection,
} from "../services/taskNavigationService";
import {
  moveSelectedTasksAsync,
  moveSelectedTasksToEndAsync,
  restoreSelectedTaskAsync,
} from "../services/taskService";
import { toggleShowDeletedTasksAsync } from "../stores/taskStore";
import ShortcutRegistry from "./shortcutRegistry";

const shortcuts: KeyboardShortcutMap = {
  key: "kanban",
  shortcuts: [
    {
      key: ["k", "ArrowUp"],
      action: () => moveSelection(Direction.Up),
    },
    {
      key: ["j", "ArrowDown"],
      action: () => moveSelection(Direction.Down),
    },
    {
      key: ["h", "ArrowLeft"],
      action: () => moveSelection(Direction.Left),
    },
    {
      key: ["l", "ArrowRight"],
      action: () => moveSelection(Direction.Right),
    },
    {
      key: "x",
      action: () => openDeleteModal(),
    },
    {
      key: "c",
      action: () => openCreateModal(),
    },
    {
      key: "e",
      action: () => openEditTaskModal(),
    },
    {
      key: "o",
      action: () => openDetailsModal(),
    },
    {
      key: "v",
      action: async () => await toggleShowDeletedTasksAsync(),
    },

    {
      shiftKey: true,
      key: ["H", "ArrowLeft"],
      action: async () => await moveSelectedTasksAsync(Direction.Left),
    },
    {
      shiftKey: true,
      key: ["L", "ArrowRight"],
      action: async () => await moveSelectedTasksAsync(Direction.Right),
    },
    {
      shiftKey: true,
      key: ["K", "ArrowUp"],
      action: () => addToSelection(Direction.Up),
    },
    {
      shiftKey: true,
      key: ["J", "ArrowDown"],
      action: () => addToSelection(Direction.Down),
    },
    {
      shiftKey: true,
      key: "G",
      action: async () => await syncGitlabAsync(),
    },
    {
      shiftKey: true,
      key: "O",
      action: () => openSelectedTaskLink(),
    },
    {
      shiftKey: true,
      key: "M",
      action: async () =>
        await createMergeRequestAndBranchForSelectedTaskAsync(),
    },
    {
      shiftKey: true,
      key: "R",
      action: async () => await restoreSelectedTaskAsync(),
    },

    {
      shiftKey: true,
      key: ["^"],
      action: async () => await moveSelectedTasksToEndAsync(Direction.Up),
    },
    {
      shiftKey: true,
      key: ["$"],
      action: async () => await moveSelectedTasksToEndAsync(Direction.Down),
    },

    {
      ctrlKey: true,
      key: ["k", "ArrowUp"],
      action: async () => await moveSelectedTasksAsync(Direction.Up),
    },
    {
      ctrlKey: true,
      key: ["j", "ArrowDown"],
      action: async () => await moveSelectedTasksAsync(Direction.Down),
    },
  ],
};

ShortcutRegistry.getInstance().registerShortcut(shortcuts);
