import { createStore } from "solid-js/store";
import { uiStore } from "./uiStore";

export type Command = {
  text: string;
  description: string;
  action: string;
  value?: string;
  beforeAction?: string;
  display: boolean;
  execute: (command: Partial<Command>, value?: string) => Promise<void>;
};

export type DropdownValue = {
  action?: string;
  value?: string;
  showAlways?: boolean;
  text: string;
  description: string;
};

export const [commandStore, setCommandStore] = createStore({
  currentCommand: null as Command | null,
  pendingCommand: null as Command | null,
  dropdownValues: [] as DropdownValue[],
  activeDropdownIndex: 0,
});

export const setCurrentCommand = (command: Command | null) => {
  setCommandStore("currentCommand", command);
};

export const setPendingCommand = (command: Command | null) => {
  setCommandStore("pendingCommand", command);
};

export const setDropdownValues = (values: DropdownValue[]) => {
  setCommandStore("dropdownValues", values);
};

export const setActiveDropdownIndex = (index: number) => {
  setCommandStore("activeDropdownIndex", index);
};

export const filteredDropdownValues = () => {
  return commandStore.dropdownValues.filter(
    (value) =>
      value.showAlways ||
      value.text?.toLowerCase().includes(uiStore.commandInputValue) ||
      value.description?.toLowerCase().includes(uiStore.commandInputValue)
  );
};
