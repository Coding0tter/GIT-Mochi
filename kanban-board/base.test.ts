import { beforeEach, spyOn } from "bun:test";
import * as customProjectService from "./src/services/customProjectService";
import * as gitlabService from "./src/services/gitlabService";
import * as notificationService from "./src/services/notificationService";
import * as modalService from "./src/services/modalService";

import * as commandStore from "./src/stores/commandStore";
import * as uiStore from "./src/stores/uiStore";
import * as taskStore from "./src/stores/taskStore";

import * as uiService from "./src/services/uiService";

export const createProjectSpy = spyOn(
  customProjectService,
  "createProjectAsync"
);
export const getProjectAsyncSpy = spyOn(
  customProjectService,
  "getProjectAsync"
);

export const setBufferSpy = spyOn(commandStore, "setBuffer");
export const loadGitLabProjectsAsyncSpy = spyOn(
  gitlabService,
  "loadGitLabProjectsAsync"
);
export const loadCustomProjectsAsyncSpy = spyOn(
  customProjectService,
  "loadCustomProjectsAsync"
);
export const setDropdownValuesSpy = spyOn(commandStore, "setDropdownValues");
export const addNotificationSpy = spyOn(notificationService, "addNotification");
export const openCreateModalSpy = spyOn(modalService, "openCreateModal");
export const setCommandInputValueSpy = spyOn(uiStore, "setCommandInputValue");
export const setCommandPlaceholderSpy = spyOn(uiStore, "setCommandPlaceholder");
export const setProjectAsyncSpy = spyOn(
  customProjectService,
  "setProjectAsync"
);
export const setCurrentProjectSpy = spyOn(uiStore, "setCurrentProject");

export const fetchTasksAsyncSpy = spyOn(taskStore, "fetchTasksAsync");

export const resetCommandlineSpy = spyOn(commandStore, "resetCommandline");
export const closeModalAndUnfocusSpy = spyOn(uiService, "closeModalAndUnfocus");
export const handleGitlabSyncAsyncSpy = spyOn(
  taskStore,
  "handleGitlabSyncAsync"
);

resetCommandlineSpy.mockImplementation(() => {});
closeModalAndUnfocusSpy.mockImplementation(() => {});

const spies = [
  addNotificationSpy,
  closeModalAndUnfocusSpy,
  createProjectSpy,
  fetchTasksAsyncSpy,
  loadCustomProjectsAsyncSpy,
  loadGitLabProjectsAsyncSpy,
  openCreateModalSpy,
  resetCommandlineSpy,
  setBufferSpy,
  handleGitlabSyncAsyncSpy,
  setCommandInputValueSpy,
  setCommandPlaceholderSpy,
  setCurrentProjectSpy,
  setProjectAsyncSpy,
  getProjectAsyncSpy,
  setDropdownValuesSpy,
];

beforeEach(() => {
  spies.forEach((spy) => spy.mockClear());
});
