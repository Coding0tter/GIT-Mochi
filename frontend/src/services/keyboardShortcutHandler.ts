import { Location, Navigator } from "@solidjs/router";
import ShortcutRegistry from "../shortcutMaps/shortcutRegistry";
import { resetCommandline } from "../stores/commandStore";
import { modalStore, ModalType } from "../stores/modalStore";
import { InputMode, uiStore } from "../stores/uiStore";
import { openHelpModal } from "./modalService";
import { closeModalAndUnfocus, focusInput } from "./uiService";

export const handleKeyDown = async (
  event: KeyboardEvent,
  navigator: Navigator,
  location: Location
) => {
  const key = location.pathname.split("/")[1];

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

  ShortcutRegistry.getInstance().executeShortcut(key, event);

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
    }

    return;
  }

  if (event.shiftKey) {
    switch (event.key) {
      case "!":
        navigator("/kanban");
        break;
      case '"':
        navigator("/timetrack");
        break;
      case "=":
        navigator("/");
        break;

      default:
        break;
    }

    return;
  }

  switch (event.key) {
    case "h":
      openHelpModal();
      break;

    default:
      break;
  }
};
