import { handleCloseModal } from "../stores/modalStore";
import {
  InputMode,
  setCommandInputValue,
  setInputMode,
  uiStore,
} from "../stores/uiStore";

export const focusInput = (inputMode: InputMode) => {
  if (uiStore.commandInputRef === null) {
    return;
  }
  setInputMode(inputMode);

  setTimeout(() => {
    uiStore.commandInputRef!.focus();
  }, 0);
};

export const closeModalAndUnfocus = () => {
  handleCloseModal();
  setInputMode(InputMode.None);
  setCommandInputValue("");
  setTimeout(() => {
    const activeElement = document.activeElement as HTMLElement;
    if (activeElement) {
      activeElement.blur();
    }
  });
};
