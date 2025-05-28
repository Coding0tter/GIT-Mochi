import type { Location, Navigator } from "@solidjs/router";
import ShortcutRegistry from "../shortcutMaps/shortcutRegistry";
import { resetCommandline } from "../stores/commandStore";
import { modalStore } from "../stores/modalStore";
import {
  CalendarMode,
  InputMode,
  setCalendarMode,
  uiStore,
} from "../stores/uiStore";
import { closeTopModal, getTopModal, openHelpModal } from "./modalService";

export const handleKeyDown = async (
  event: KeyboardEvent,
  navigator: Navigator,
  location: Location,
) => {
  const key = location.pathname.split("/")[1];

  if (event.key === "Escape" || event.key === "q") {
    if (modalStore.activeModals.length > 0) {
      const topModal = getTopModal();

      if (topModal) {
        closeTopModal();
      }
    }

    // closeModalAndUnfocus();
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
    document.activeElement?.tagName === "SELECT"
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
        navigator("/todo");
        return;
      case "Digit0":
        navigator("/");
        return;
    }
  }

  if (event.shiftKey && event.key === "?") {
    openHelpModal();
    return;
  }

  if (!modalStore.activeModals.length) {
    ShortcutRegistry.getInstance().executeShortcut(key, event);
  } else {
    const topModal = getTopModal();
    ShortcutRegistry.getInstance().executeShortcut(topModal, event, true);
  }
};
