import { createStore, reconcile } from "solid-js/store";

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

export enum LoadingTarget {
  Commandline,
  SyncGitlab,
  LoadTasks,
  None,
}

export const [uiStore, setUiStore] = createStore({
  commandInputRef: null as HTMLInputElement | null,
  currentProject: null as Project | null,
  commandInputValue: "",
  commandPlaceholder: "",
  commandReadonly: false,
  loadingTarget: LoadingTarget.None,
  isConnected: false,
  inputMode: InputMode.None,
  calendarHeight: 0,
});

export const setCalendarHeight = (height: number) => {
  setUiStore("calendarHeight", height);
};

export const setConnected = (connected: boolean) => {
  setUiStore("isConnected", connected);
};

export const setCommandInputRef = (ref: HTMLInputElement | null) => {
  setUiStore("commandInputRef", ref);
};

export const setCommandPlaceholder = (placeholder: string) => {
  setUiStore("commandPlaceholder", placeholder);
};

export const setCommandReadonly = (readonly: boolean) => {
  setUiStore("commandReadonly", readonly);
};

export const setLoading = (loadingTarget: LoadingTarget) => {
  setUiStore("loadingTarget", loadingTarget);
};

export const setInputMode = (mode: InputMode) => {
  setUiStore("inputMode", mode);
};

export const setCommandInputValue = (value: string) => {
  setUiStore("commandInputValue", value);
};

export const setCurrentProject = (project: Project | null) => {
  setUiStore("currentProject", reconcile(project));
};
