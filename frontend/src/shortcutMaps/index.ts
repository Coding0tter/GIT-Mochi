import "./kanbanShortcutMap";

export type KeyboardShortcutMap = {
  key: string;
  shortcuts: Shortcut[];
};

export type Shortcut = {
  action: () => any;
  key: string[] | string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
};
