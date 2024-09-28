import { createStore } from "solid-js/store";

export enum InputMode {
  None,
  Search,
  Commandline,
}

export type Project = {
  id: string;
  name_with_namespace: string;
  description: string;
};

export const [uiStore, setUiStore] = createStore({
  commandInputRef: null as HTMLInputElement | null,
  currentProject: null as Project | null,
  commandInputValue: "",
  loading: false,
  inputMode: InputMode.None,
});

export const setCommandInputRef = (ref: HTMLInputElement | null) => {
  setUiStore("commandInputRef", ref);
};

export const setLoading = (loading: boolean) => {
  setUiStore("loading", loading);
};

export const setInputMode = (mode: InputMode) => {
  setUiStore("inputMode", mode);
};

export const setCommandInputValue = (value: string) => {
  setUiStore("commandInputValue", value);
};

export const setCurrentProject = (project: Project | null) => {
  setUiStore("currentProject", project);
};
