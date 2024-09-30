import { afterEach, jest, spyOn } from "bun:test";
import * as customProjectService from "./src/services/customProjectService";
import * as gitlabService from "./src/services/gitlabService";
import * as notificationService from "./src/services/notificationService";
import * as modalService from "./src/services/modalService";

import * as commandStore from "./src/stores/commandStore";
import * as uiStore from "./src/stores/uiStore";
import * as taskStore from "./src/stores/taskStore";
import * as taskService from "./src/services/taskService";
import * as uiService from "./src/services/uiService";
import { resetCommandRegistry } from "./src/commands/commandRegistry";
import * as modalStore from "./src/stores/modalStore";
import { ModalType, setActiveModal } from "./src/stores/modalStore";

export const useSpies = () => {
  return {
    // Gitlab Service Spies
    loadGitLabProjectsAsyncSpy: spyOn(
      gitlabService,
      "loadGitLabProjectsAsync"
    ).mockClear(),
    createMergeRequestAndBranchAsyncSpy: spyOn(
      gitlabService,
      "createMergeRequestAndBranchAsync"
    ),

    // Notification Service Spies
    addNotificationSpy: spyOn(
      notificationService,
      "addNotification"
    ).mockClear(),

    // Modal Service Spies
    openCreateModalSpy: spyOn(modalService, "openCreateModal").mockClear(),

    // Modal Store Spies
    setActiveModalSpy: spyOn(modalStore, "setActiveModal").mockClear(),
    setSelectedTaskForModalSpy: spyOn(
      modalStore,
      "setSelectedTaskForModal"
    ).mockClear(),

    // Custom Project Service Spies
    createProjectAsyncSpy: spyOn(
      customProjectService,
      "createProjectAsync"
    ).mockClear(),
    getProjectAsyncSpy: spyOn(
      customProjectService,
      "getProjectAsync"
    ).mockClear(),
    loadCustomProjectsAsyncSpy: spyOn(
      customProjectService,
      "loadCustomProjectsAsync"
    ).mockClear(),
    setProjectAsyncSpy: spyOn(
      customProjectService,
      "setProjectAsync"
    ).mockClear(),

    // UI Service Spies
    closeModalAndUnfocusSpy: spyOn(uiService, "closeModalAndUnfocus")
      .mockImplementation(() => {})
      .mockClear(),
    focusInputSpy: spyOn(uiService, "focusInput").mockClear(),

    // Task Service Spies
    moveSelectedTasksAsyncSpy: spyOn(
      taskService,
      "moveSelectedTasksAsync"
    ).mockClear(),

    // Task Store Spies
    fetchTasksAsyncSpy: spyOn(taskStore, "fetchTasksAsync")
      .mockResolvedValue([])
      .mockClear(),
    handleGitlabSyncAsyncSpy: spyOn(
      taskStore,
      "handleGitlabSyncAsync"
    ).mockClear(),
    getColumnTasksSpy: spyOn(taskStore, "getColumnTasks").mockClear(),

    // UI Store Spies
    setCommandInputValueSpy: spyOn(uiStore, "setCommandInputValue").mockClear(),
    setCommandPlaceholderSpy: spyOn(
      uiStore,
      "setCommandPlaceholder"
    ).mockClear(),
    setCurrentProjectSpy: spyOn(uiStore, "setCurrentProject").mockClear(),
    setLoadingSpy: spyOn(uiStore, "setLoading").mockClear(),

    // Command Store Spies
    setBufferSpy: spyOn(commandStore, "setBuffer").mockClear(),
    setDropdownValuesSpy: spyOn(commandStore, "setDropdownValues").mockClear(),
    resetCommandlineSpy: spyOn(commandStore, "resetCommandline").mockClear(),
    setPendingCommandSpy: spyOn(commandStore, "setPendingCommand").mockClear(),
    setActiveDropdownIndexSpy: spyOn(
      commandStore,
      "setActiveDropdownIndex"
    ).mockClear(),
    setWaitingForInputSpy: spyOn(
      commandStore,
      "setWaitingForInput"
    ).mockClear(),
  };
};

// Reset the command registry before each test
afterEach(() => {
  jest.restoreAllMocks();

  global.document = Object.create({});
  global.window = Object.create({});

  setActiveModal(ModalType.None);
  resetCommandRegistry();
});
