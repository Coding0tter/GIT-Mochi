export enum KeyboardShortcutCategory {
  Navigation = "Navigation",
  TaskManagement = "Task Management",
  GitlabAction = "Gitlab Action",
  CalendarManagement = "Calendar Management",
  Commands = "Commands",
}

export type KeyboardShortcutMap = {
  key: string;
  shortcuts: Shortcut[];
};

export type Shortcut = {
  action: () => any;
  key: string[] | string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  category: KeyboardShortcutCategory;
  description: string;
};
