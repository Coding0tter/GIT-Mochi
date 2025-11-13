import type { Location, Navigator } from "@solidjs/router";
import ShortcutRegistry from "../shortcutMaps/shortcutRegistry";
import { resetCommandline } from "../stores/commandStore";
import {
  CalendarMode,
  InputMode,
  setCalendarMode,
  uiStore,
} from "../stores/uiStore";
import { unfocusInputs } from "./uiService";
import {
  getTopModal,
  modalStore,
  ModalType,
  openModal,
} from "@client/shared/stores/modal.store.ts";
import { setInput } from "@client/shared/stores/commandline.store.ts";

export const handleKeyDown = async (
  event: KeyboardEvent,
  navigator: Navigator,
  location: Location,
) => {
  const key = location.pathname.split("/").slice(1).join("/");

  if (
    (event.key === "Escape" || event.key === "q") &&
    !modalStore.activeModals.length
  ) {
    unfocusInputs();
    setCalendarMode(CalendarMode.Time);

    if (
      uiStore.inputMode === InputMode.Commandline ||
      (uiStore.inputMode === InputMode.Search &&
        uiStore.commandInputValue === "")
    ) {
      resetCommandline();
      setInput("");
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
        navigator("/app/kanban");
        return;
      case "Digit2":
        navigator("/timetrack");
        return;
      case "Digit3":
        navigator("/app/todo");
        return;
      case "Digit0":
        navigator("/");
        return;
    }
  }

  if (event.shiftKey && event.key === "?") {
    openModal(ModalType.Help);
    return;
  }

  if (!modalStore.activeModals.length) {
    ShortcutRegistry.getInstance().executeShortcut(key, event);
  } else {
    const topModal = getTopModal();
    if (topModal) {
      ShortcutRegistry.getInstance().executeShortcut(topModal, event);
    }
  }
};
