import axios from "axios";
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
  LoadDiscussions,
  Commandline,
  SyncGitlab,
  LoadTasks,
  Todos,
  None,
}

export enum CalendarMode {
  Time = "time",
  Appointment = "appointment",
}

type UiState = {
  commandInputRef: HTMLInputElement | null;
  currentProject: Project | null;
  commandInputValue: string;
  commandPlaceholder: string;
  commandReadonly: boolean;
  loadingTarget: LoadingTarget;
  isConnected: boolean;
  inputMode: InputMode;
  calendarHeight: number;
  calendarMode: CalendarMode;
  user: IUser | null;
  lastSync: Date | null;
};

interface IUser {
  gitlabId: number;
  username: string;
  email: string;
  name: string;
  avatar_url: string;
}

export const [uiStore, setUiStore] = createStore<UiState>({
  commandInputRef: null,
  currentProject: null,
  commandInputValue: "",
  commandPlaceholder: "",
  commandReadonly: false,
  loadingTarget: LoadingTarget.None,
  isConnected: false,
  inputMode: InputMode.None,
  calendarHeight: 0,
  calendarMode: CalendarMode.Time,
  user: null,
  lastSync: null,
});

const updateField = <K extends keyof UiState>(field: K, value: UiState[K]) => {
  setUiStore(field, value);
};

export const fetchLastSync = async () => {
  const response = await axios.get("/settings/lastSync");

  setLastSync(response.data);

  return response.data;
};

export const setCalendarMode = (mode: CalendarMode) =>
  updateField("calendarMode", mode);
export const setCalendarHeight = (height: number) =>
  updateField("calendarHeight", height);
export const setConnected = (connected: boolean) =>
  updateField("isConnected", connected);
export const setCommandInputRef = (ref: HTMLInputElement | null) =>
  updateField("commandInputRef", ref);
export const setCommandPlaceholder = (placeholder: string) =>
  updateField("commandPlaceholder", placeholder);
export const setCommandReadonly = (readonly: boolean) =>
  updateField("commandReadonly", readonly);
export const setLoading = (loadingTarget: LoadingTarget) =>
  updateField("loadingTarget", loadingTarget);
export const setInputMode = (mode: InputMode) => updateField("inputMode", mode);
export const setCommandInputValue = (value: string) =>
  updateField("commandInputValue", value);
export const setUser = (user: any) => updateField("user", user);
export const setCurrentProject = (project: Project | null) => {
  setUiStore("currentProject", reconcile(project));
};

export const setLastSync = (lastSync: Date | null) => {
  setUiStore("lastSync", lastSync);
};
