import { KeyboardShortcutMap } from ".";
import { Direction } from "../services/taskNavigationService";
import {
  addToSelection,
  moveSelection,
} from "../services/timetrackNavigationService";
import { setSelectedQuarterHourIndex } from "../stores/keyboardNavigationStore";
import ShortcutRegistry from "./shortcutRegistry";

const shortcuts: KeyboardShortcutMap = {
  key: "timetrack",
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
      shiftKey: true,
      key: ["ArrowUp"],
      action: () => addToSelection(Direction.Up),
    },
    {
      shiftKey: true,
      key: ["ArrowDown"],
      action: () => addToSelection(Direction.Down),
    },

    {
      ctrlKey: true,
      key: ["ArrowUp"],
      action: () => moveSelection(Direction.Up, true),
    },
    {
      ctrlKey: true,
      key: ["ArrowDown"],
      action: () => moveSelection(Direction.Down, true),
    },

    {
      ctrlKey: true,
      shiftKey: true,
      key: ["ArrowUp"],
      action: () => addToSelection(Direction.Up, true),
    },
    {
      ctrlKey: true,
      shiftKey: true,
      key: ["ArrowDown"],
      action: () => addToSelection(Direction.Down, true),
    },
  ],
};

ShortcutRegistry.getInstance().registerShortcut(shortcuts);
