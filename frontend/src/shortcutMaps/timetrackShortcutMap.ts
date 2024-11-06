import { KeyboardShortcutMap } from ".";
import { Direction } from "../services/taskNavigationService";
import { moveSelection } from "../services/timetrackNavigationService";
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
      ctrlKey: true,
      key: ["ArrowUp"],
      action: () => moveSelection(Direction.Up, true),
    },
    {
      ctrlKey: true,
      key: ["ArrowDown"],
      action: () => moveSelection(Direction.Down, true),
    },
  ],
};

ShortcutRegistry.getInstance().registerShortcut(shortcuts);
