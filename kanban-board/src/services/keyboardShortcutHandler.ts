import { commandStore, resetCommandline } from "../stores/commandStore";
import { modalStore, ModalType } from "../stores/modalStore";
import { toggleShowDeletedTasksAsync } from "../stores/taskStore";
import { InputMode, uiStore } from "../stores/uiStore";
import {
  createMergeRequestAndBranchForSelectedTaskAsync,
  openSelectedTaskLink,
  syncGitlabAsync,
} from "./gitlabService";
import {
  openCreateModal,
  openDeleteModal,
  openDetailsModal,
  openEditModal,
  openHelpModal,
} from "./modalService";
import {
  addToSelection,
  Direction,
  moveSelection,
} from "./taskNavigationService";
import {
  moveSelectedTasksAsync,
  restoreSelectedTaskAsync,
} from "./taskService";
import { closeModalAndUnfocus, focusInput } from "./uiService";

export const handleKeyDown = async (event: KeyboardEvent) => {
  if (event.key === "Escape") {
    closeModalAndUnfocus();

    if (
      uiStore.inputMode === InputMode.Commandline ||
      (uiStore.inputMode === InputMode.Search &&
        uiStore.commandInputValue === "")
    ) {
      resetCommandline();
    }
    return;
  }

  if (
    document.activeElement?.tagName === "INPUT" ||
    document.activeElement?.tagName === "TEXTAREA" ||
    document.activeElement?.tagName === "SELECT" ||
    modalStore.activeModal !== ModalType.None
  ) {
    return;
  }

  if (event.ctrlKey) {
    switch (event.key) {
      case "p":
        event.preventDefault();
        event.stopPropagation();
        focusInput(InputMode.Commandline);
        break;
      case "f":
        event.preventDefault();
        event.stopPropagation();
        focusInput(InputMode.Search);
        break;
      case "w":
      case "ArrowUp":
        event.preventDefault();
        event.stopPropagation();
        await moveSelectedTasksAsync(Direction.Up);
        break;
      case "s":
      case "ArrowDown":
        event.preventDefault();
        event.stopPropagation();
        await moveSelectedTasksAsync(Direction.Down);
        break;
      default:
        break;
    }

    return;
  }

  if (event.shiftKey) {
    switch (event.key) {
      case "A":
      case "ArrowLeft":
        await moveSelectedTasksAsync(Direction.Left);
        break;

      case "D":
      case "ArrowRight":
        await moveSelectedTasksAsync(Direction.Right);
        break;

      case "ArrowUp":
        await addToSelection(Direction.Up);
        break;

      case "ArrowDown":
        await addToSelection(Direction.Down);
        break;

      case "S":
        await syncGitlabAsync();
        break;

      case "O":
        openSelectedTaskLink();
        break;

      case "M":
        await createMergeRequestAndBranchForSelectedTaskAsync();
        break;

      case "R":
        restoreSelectedTaskAsync();
        break;

      default:
        break;
    }

    return;
  }

  switch (event.key) {
    case "w":
    case "ArrowUp":
      moveSelection(Direction.Up);
      break;

    case "s":
    case "ArrowDown":
      moveSelection(Direction.Down);
      break;

    case "a":
    case "ArrowLeft":
      moveSelection(Direction.Left);
      break;

    case "d":
    case "ArrowRight":
      moveSelection(Direction.Right);
      break;

    case "n":
      await moveSelectedTasksAsync(Direction.Right);
      break;

    case "p":
      await moveSelectedTasksAsync(Direction.Left);
      break;

    case "h":
      openHelpModal();
      break;

    case "x":
      openDeleteModal();
      break;

    case "c":
      openCreateModal();
      break;

    case "e":
      openEditModal();
      break;

    case "o":
      openDetailsModal();
      break;

    case "v":
      await toggleShowDeletedTasksAsync();
      break;
    default:
      break;
  }
};
