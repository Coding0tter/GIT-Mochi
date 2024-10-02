import { afterEach, beforeEach, jest, spyOn } from "bun:test";
import * as customProjectService from "./src/services/customProjectService";
import * as gitlabService from "./src/services/gitlabService";
import * as notificationService from "./src/services/notificationService";
import * as modalService from "./src/services/modalService";

import * as commandStore from "./src/stores/commandStore";
import * as uiStore from "./src/stores/uiStore";
import * as taskStore from "./src/stores/taskStore";
import * as taskService from "./src/services/taskService";
import * as taskNavigationService from "./src/services/taskNavigationService";
import * as uiService from "./src/services/uiService";
import { resetCommandRegistry } from "./src/commands/commandRegistry";
import * as modalStore from "./src/stores/modalStore";
import { ModalType, setActiveModal } from "./src/stores/modalStore";
import axios from "axios";
import { setSelectedTaskIndex } from "./src/stores/keyboardNavigationStore";

export const useSpies = () => {
  return {
    // axios Spies
    postSpy: spyOn(axios, "post").mockResolvedValue({ status: 200 }),
    getSpy: spyOn(axios, "get").mockResolvedValue({ status: 200 }),
    putSpy: spyOn(axios, "put").mockResolvedValue({ status: 200 }),
    deleteSpy: spyOn(axios, "delete").mockResolvedValue({ status: 200 }),
    patchSpy: spyOn(axios, "patch").mockResolvedValue({ status: 200 }),

    // Gitlab Service Spies
    loadGitLabProjectsAsyncSpy: spyOn(
      gitlabService,
      "loadGitLabProjectsAsync"
    ).mockClear(),
    createMergeRequestAndBranchAsyncSpy: spyOn(
      gitlabService,
      "createMergeRequestAndBranchAsync"
    ),
    syncGitlabAsyncSpy: spyOn(gitlabService, "syncGitlabAsync").mockClear(),
    openSelectedTaskLinkSpy: spyOn(
      gitlabService,
      "openSelectedTaskLink"
    ).mockClear(),
    createMergeRequestAndBranchForSelectedTaskAsyncSpy: spyOn(
      gitlabService,
      "createMergeRequestAndBranchForSelectedTaskAsync"
    ).mockClear(),

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
    handleCloseModalSpy: spyOn(modalStore, "handleCloseModal").mockClear(),

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
    closeModalAndUnfocusSpy: spyOn(
      uiService,
      "closeModalAndUnfocus"
    ).mockClear(),
    focusInputSpy: spyOn(uiService, "focusInput").mockClear(),

    // Task Service Spies
    moveSelectedTasksAsyncSpy: spyOn(
      taskService,
      "moveSelectedTasksAsync"
    ).mockClear(),
    restoreSelectedTaskAsyncSpy: spyOn(
      taskService,
      "restoreSelectedTaskAsync"
    ).mockClear(),
    updateTaskAsyncSpy: spyOn(taskService, "updateTaskAsync").mockClear(),

    // Task Store Spies
    fetchTasksAsyncSpy: spyOn(taskStore, "fetchTasksAsync")
      .mockResolvedValue([])
      .mockClear(),
    handleGitlabSyncAsyncSpy: spyOn(
      taskStore,
      "handleGitlabSyncAsync"
    ).mockClear(),
    getColumnTasksSpy: spyOn(taskStore, "getColumnTasks").mockClear(),
    toggleShowDeletedTasksAsyncSpy: spyOn(
      taskStore,
      "toggleShowDeletedTasksAsync"
    ).mockClear(),
    filteredTasksSpy: spyOn(taskStore, "filteredTasks").mockClear(),

    // Task Navigation Service Spies
    addToSelectionSpy: spyOn(
      taskNavigationService,
      "addToSelection"
    ).mockClear(),
    moveSelectionSpy: spyOn(taskNavigationService, "moveSelection").mockClear(),

    // UI Store Spies
    setCommandInputValueSpy: spyOn(uiStore, "setCommandInputValue").mockClear(),
    setCommandPlaceholderSpy: spyOn(
      uiStore,
      "setCommandPlaceholder"
    ).mockClear(),
    setCurrentProjectSpy: spyOn(uiStore, "setCurrentProject").mockClear(),
    setLoadingSpy: spyOn(uiStore, "setLoading").mockClear(),
    setInputModeSpy: spyOn(uiStore, "setInputMode").mockClear(),

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

beforeEach(() => {
  setSelectedTaskIndex(0);
  jest.restoreAllMocks();
});

afterEach(() => {
  global.document = Object.create({});
  global.window = Object.create({});

  setActiveModal(ModalType.None);
  resetCommandRegistry();
});
