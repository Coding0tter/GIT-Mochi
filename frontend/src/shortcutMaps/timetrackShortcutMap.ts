import { openEditAppointmentModal } from "../services/modalService";
import { Direction } from "../services/taskNavigationService";
import {
  addToSelection,
  moveSelection,
} from "../services/timetrackNavigationService";
import { toggleTimetrackAsync } from "../stores/timeTrackStore";
import { CalendarMode, setCalendarMode } from "../stores/uiStore";
import ShortcutRegistry from "./shortcutRegistry";
import { KeyboardShortcutCategory, KeyboardShortcutMap } from "./types";

const shortcuts: KeyboardShortcutMap = {
  key: "timetrack",
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
      key: "a",
      action: () => setCalendarMode(CalendarMode.Appointment),
      category: KeyboardShortcutCategory.Navigation,
      description: "Switch to appointment mode",
    },
    {
      key: "t",
      action: () => setCalendarMode(CalendarMode.Time),
      category: KeyboardShortcutCategory.Navigation,
      description: "Switch to time mode",
    },
    {
      key: "e",
      action: () => openEditAppointmentModal(),
      category: KeyboardShortcutCategory.CalendarManagement,
      description: "Edit appointment",
    },

    {
      shiftKey: true,
      key: ["K", "ArrowUp"],
      action: () => addToSelection(Direction.Up),
      category: KeyboardShortcutCategory.Navigation,
      description: "Add to selection up",
    },
    {
      shiftKey: true,
      key: ["J", "ArrowDown"],
      action: () => addToSelection(Direction.Down),
      category: KeyboardShortcutCategory.Navigation,
      description: "Add to selection down",
    },

    {
      ctrlKey: true,
      key: ["k", "ArrowUp"],
      action: () => moveSelection(Direction.Up, true),
      category: KeyboardShortcutCategory.Navigation,
      description: "Move selection up (by hour)",
    },
    {
      ctrlKey: true,
      key: ["j", "ArrowDown"],
      action: () => moveSelection(Direction.Down, true),
      category: KeyboardShortcutCategory.Navigation,
      description: "Move selection down (by hour)",
    },
    {
      ctrlKey: true,
      key: "l",
      action: async () => await toggleTimetrackAsync(),
      category: KeyboardShortcutCategory.CalendarManagement,
      description: "Start / stop timetracking",
    },

    {
      ctrlKey: true,
      shiftKey: true,
      key: ["K", "ArrowUp"],
      action: () => addToSelection(Direction.Up, true),
      category: KeyboardShortcutCategory.Navigation,
      description: "Add to selection up (by hour)",
    },
    {
      ctrlKey: true,
      shiftKey: true,
      key: ["J", "ArrowDown"],
      action: () => addToSelection(Direction.Down, true),
      category: KeyboardShortcutCategory.Navigation,
      description: "Add to selection down (by hour)",
    },
  ],
};

ShortcutRegistry.getInstance().registerShortcut(shortcuts);
