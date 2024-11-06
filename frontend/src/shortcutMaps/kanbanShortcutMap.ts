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
  openEditModal,
} from "../services/modalService";
import {
  addToSelection,
  Direction,
  moveSelection,
} from "../services/taskNavigationService";
import {
  moveSelectedTasksAsync,
  restoreSelectedTaskAsync,
} from "../services/taskService";
import { focusInput } from "../services/uiService";
import { toggleShowDeletedTasksAsync } from "../stores/taskStore";
import { InputMode } from "../stores/uiStore";
import ShortcutRegistry from "./shortcutRegistry";

const shortcuts: KeyboardShortcutMap = {
  key: "kanban",
  shortcuts: [
    {
      key: ["w", "ArrowUp"],
      action: () => moveSelection(Direction.Up),
    },
    {
      key: ["s", "ArrowDown"],
      action: () => moveSelection(Direction.Down),
    },
    {
      key: ["a", "ArrowLeft"],
      action: () => moveSelection(Direction.Left),
    },
    {
      key: ["d", "ArrowRight"],
      action: () => moveSelection(Direction.Right),
    },
    {
      key: "n",
      action: async () => await moveSelectedTasksAsync(Direction.Right),
    },
    {
      key: "p",
      action: async () => await moveSelectedTasksAsync(Direction.Left),
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
      action: () => openEditModal(),
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
      key: ["A", "ArrowLeft"],
      action: async () => await moveSelectedTasksAsync(Direction.Left),
    },
    {
      shiftKey: true,
      key: ["D", "ArrowRight"],
      action: async () => await moveSelectedTasksAsync(Direction.Right),
    },
    {
      shiftKey: true,
      key: ["W", "ArrowUp"],
      action: () => addToSelection(Direction.Up),
    },
    {
      shiftKey: true,
      key: ["S", "ArrowDown"],
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
      action: () => createMergeRequestAndBranchForSelectedTaskAsync(),
    },
    {
      shiftKey: true,
      key: "R",
      action: () => restoreSelectedTaskAsync(),
    },

    {
      ctrlKey: true,
      key: ["w", "ArrowUp"],
      action: async () => moveSelectedTasksAsync(Direction.Up),
    },
    {
      ctrlKey: true,
      key: ["s", "ArrowDown"],
      action: async () => moveSelectedTasksAsync(Direction.Down),
    },
  ],
};

ShortcutRegistry.getInstance().registerShortcut(shortcuts);
