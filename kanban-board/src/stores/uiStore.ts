import { createStore } from "solid-js/store";

export enum InputMode {
  None,
  Search,
  Commandline,
}

export type Project = {
  id: string;
  _id?: string;
  custom: boolean;
  name_with_namespace?: string;
  name?: string;
  description: string;
};

export const [uiStore, setUiStore] = createStore({
  commandInputRef: null as HTMLInputElement | null,
  currentProject: null as Project | null,
  commandInputValue: "",
  commandPlaceholder: "",
  commandReadonly: false,
  loading: false,
  inputMode: InputMode.None,
});

export const setCommandInputRef = (ref: HTMLInputElement | null) => {
  setUiStore("commandInputRef", ref);
};

export const setCommandPlaceholder = (placeholder: string) => {
  setUiStore("commandPlaceholder", placeholder);
};

export const setCommandReadonly = (readonly: boolean) => {
  setUiStore("commandReadonly", readonly);
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
