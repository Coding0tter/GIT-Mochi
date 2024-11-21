import { KeyboardShortcutMap } from ".";
import { openEditAppointmentModal } from "../services/modalService";
import { Direction } from "../services/taskNavigationService";
import {
  addToSelection,
  moveSelection,
} from "../services/timetrackNavigationService";
import { toggleTimetrackAsync } from "../stores/timeTrackStore";
import { CalendarMode, setCalendarMode } from "../stores/uiStore";
import ShortcutRegistry from "./shortcutRegistry";

const shortcuts: KeyboardShortcutMap = {
  key: "timetrack",
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
      key: "a",
      action: () => setCalendarMode(CalendarMode.Appointment),
    },
    {
      key: "t",
      action: () => setCalendarMode(CalendarMode.Time),
    },
    {
      key: "e",
      action: () => openEditAppointmentModal(),
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
      ctrlKey: true,
      key: ["k", "ArrowUp"],
      action: () => moveSelection(Direction.Up, true),
    },
    {
      ctrlKey: true,
      key: ["j", "ArrowDown"],
      action: () => moveSelection(Direction.Down, true),
    },
    {
      ctrlKey: true,
      key: "l",
      action: async () => await toggleTimetrackAsync(),
    },

    {
      ctrlKey: true,
      shiftKey: true,
      key: ["K", "ArrowUp"],
      action: () => addToSelection(Direction.Up, true),
    },
    {
      ctrlKey: true,
      shiftKey: true,
      key: ["J", "ArrowDown"],
      action: () => addToSelection(Direction.Down, true),
    },
  ],
};

ShortcutRegistry.getInstance().registerShortcut(shortcuts);
