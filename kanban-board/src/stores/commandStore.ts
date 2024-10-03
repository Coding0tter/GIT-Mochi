import { createStore, reconcile } from "solid-js/store";
import {
  InputMode,
  setCommandInputValue,
  setCommandReadonly,
  setInputMode,
  uiStore,
} from "./uiStore";

export type Command = {
  text: string;
  description: string;
  action: string;
  value?: string;
  beforeAction?: string;
  nextAction?: string;
  display: boolean;
  execute: () => Promise<void>;
  createOptions?: () => Promise<void>;
};

export type DropdownValue = {
  text: string;
  description?: string;
  value?: any;
  showAlways?: boolean;
};

export const [commandStore, setCommandStore] = createStore({
  dropdownValues: [] as DropdownValue[],
  waitingForInput: false,
  activeDropdownIndex: 0,
  buffer: null as any,
  pendingCommand: undefined as Command | undefined,
});

export const setDropdownValues = (values: DropdownValue[]) => {
  setCommandStore("dropdownValues", values);
};

export const setActiveDropdownIndex = (index: number) => {
  setCommandStore("activeDropdownIndex", index);
};

export const setWaitingForInput = (value: boolean) => {
  setCommandStore("waitingForInput", value);
};

export const setBuffer = (value: any) => {
  setCommandStore("buffer", value);
};

export const setPendingCommand = (command: Command | undefined) => {
  setCommandStore("pendingCommand", reconcile(command));
};

export const filteredDropdownValues = () => {
  return commandStore.dropdownValues.filter(
    (value) =>
      value.showAlways ||
      value.text?.toLowerCase().includes(uiStore.commandInputValue) ||
      value.description?.toLowerCase().includes(uiStore.commandInputValue)
  );
};

export const getActiveDropdownValue = () => {
  return filteredDropdownValues()[commandStore.activeDropdownIndex];
};

export const resetCommandline = () => {
  setWaitingForInput(false);
  setActiveDropdownIndex(0);
  setDropdownValues([]);
  setCommandReadonly(false);
  setBuffer(null);

  setInputMode(InputMode.None);
  setCommandInputValue("");
};
