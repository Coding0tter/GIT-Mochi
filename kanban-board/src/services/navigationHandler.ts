import { ModalType } from "../App";
import { CommandHandler, CommandHandlerProps } from "./commandHandler";

export const handleKeyDown = async (
  event: KeyboardEvent,
  activeModal: ModalType,
  commandHandler: CommandHandler
) => {
  if (event.key === "Escape") {
    commandHandler.closeModalAndUnfocus();
  }

  if (
    document.activeElement?.tagName === "INPUT" ||
    document.activeElement?.tagName === "TEXTAREA" ||
    document.activeElement?.tagName === "SELECT" ||
    activeModal !== ModalType.None
  ) {
    return;
  }

  if (event.ctrlKey) {
    switch (event.key) {
      case "p":
        event.preventDefault();
        event.stopPropagation();
        commandHandler.openCommandline();
        break;
      case "f":
        event.preventDefault();
        event.stopPropagation();
        commandHandler.openSearch();
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
        await commandHandler.moveTaskAsync("previous");
        break;

      case "D":
      case "ArrowRight":
        await commandHandler.moveTaskAsync("next");
        break;

      case "S":
        commandHandler.syncGitlab();
        break;

      case "O":
        commandHandler.openLink();
        break;

      case "M":
        commandHandler.createMergeRequestForSelectedAsync();
        break;

      case "R":
        commandHandler.restoreTaskAsync();
        break;

      default:
        break;
    }

    return;
  }

  switch (event.key) {
    case "w":
    case "ArrowUp":
      commandHandler.moveSelection("up");
      break;

    case "s":
    case "ArrowDown":
      commandHandler.moveSelection("down");
      break;

    case "a":
    case "ArrowLeft":
      commandHandler.moveSelection("left");
      break;

    case "d":
    case "ArrowRight":
      commandHandler.moveSelection("right");
      break;

    case "n":
      await commandHandler.moveTaskAsync("next");
      break;

    case "p":
      await commandHandler.moveTaskAsync("previous");
      break;

    case "h":
      commandHandler.openHelp();
      break;

    case "x":
      commandHandler.openDelete();
      break;

    case "c":
      commandHandler.openCreate();
      break;

    case "e":
      commandHandler.openEdit();
      break;

    case "o":
      commandHandler.openDetails();
      break;

    case "v":
      commandHandler.toggleShowDeleted();
      break;
    default:
      break;
  }
};
