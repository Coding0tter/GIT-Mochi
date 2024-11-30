import { Location, Navigator } from "@solidjs/router";
import ShortcutRegistry from "../shortcutMaps/shortcutRegistry";
import { resetCommandline } from "../stores/commandStore";
import { modalStore, ModalType } from "../stores/modalStore";
import {
  CalendarMode,
  InputMode,
  setCalendarMode,
  uiStore,
} from "../stores/uiStore";
import { closeModalAndUnfocus } from "./uiService";

export const handleKeyDown = async (
  event: KeyboardEvent,
  navigator: Navigator,
  location: Location
) => {
  const key = location.pathname.split("/")[1];

  if (event.key === "Escape") {
    closeModalAndUnfocus();
    setCalendarMode(CalendarMode.Time);

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

  if (event.shiftKey) {
    switch (event.code) {
      case "Digit1":
        navigator("/kanban");
        return;
      case "Digit2":
        navigator("/timetrack");
        return;
      case "Digit3":
        navigator("/");
        return;
    }
  }

  ShortcutRegistry.getInstance().executeShortcut(key, event);
};
