import { openHelpModal } from "../services/modalService";
import { focusInput } from "../services/uiService";
import { InputMode } from "../stores/uiStore";
import ShortcutRegistry from "./shortcutRegistry";
import { type KeyboardShortcutMap, KeyboardShortcutCategory } from "./types";

const shortcuts: KeyboardShortcutMap = {
  key: "base",
  shortcuts: [
    {
      key: ":",
      action: () => focusInput(InputMode.Commandline),
      category: KeyboardShortcutCategory.Commands,
      description: "Open commandline",
    },
    {
      key: "/",
      action: () => focusInput(InputMode.Search),
      category: KeyboardShortcutCategory.Commands,
      description: "Open search",
    },

    {
      shiftKey: true,
      key: ":",
      action: () => focusInput(InputMode.Commandline),
      category: KeyboardShortcutCategory.Commands,
      description: "Open commandline",
    },
    {
      shiftKey: true,
      key: "?",
      action: () => openHelpModal(),
      category: KeyboardShortcutCategory.Commands,
      description: "Open help",
    },
    {
      ctrlKey: true,
      key: "p",
      action: () => focusInput(InputMode.Commandline),
      category: KeyboardShortcutCategory.Commands,
      description: "Focus commandline",
    },
    {
      ctrlKey: true,
      key: "f",
      action: () => focusInput(InputMode.Search),
      category: KeyboardShortcutCategory.Commands,
      description: "Focus search",
    },
  ],
};

ShortcutRegistry.getInstance().registerShortcut(shortcuts);
