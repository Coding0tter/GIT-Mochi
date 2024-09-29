import { beforeEach, spyOn } from "bun:test";
import * as customProjectService from "./src/services/customProjectService";
import * as gitlabService from "./src/services/gitlabService";
import * as notificationService from "./src/services/notificationService";
import * as modalService from "./src/services/modalService";

import * as commandStore from "./src/stores/commandStore";
import * as uiStore from "./src/stores/uiStore";

export const createProjectSpy = spyOn(
  customProjectService,
  "createProjectAsync"
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

const spies = [
  createProjectSpy,
  setBufferSpy,
  loadGitLabProjectsAsyncSpy,
  loadCustomProjectsAsyncSpy,
  setDropdownValuesSpy,
  addNotificationSpy,
  setCommandInputValueSpy,
  setCommandPlaceholderSpy,
  openCreateModalSpy,
];

beforeEach(() => {
  spies.forEach((spy) => spy.mockClear());
});
