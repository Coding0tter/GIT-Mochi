import { handleCloseModal } from "../stores/modalStore";
import { InputMode, setInputMode, uiStore } from "../stores/uiStore";

export const focusInput = (inputMode: InputMode) => {
  if (uiStore.commandInputRef === null) {
    return;
  }
  setInputMode(inputMode);

  setTimeout(() => {
    uiStore.commandInputRef!.select();
    uiStore.commandInputRef!.focus();
  }, 0);
};

export const unfocusInputs = () => {
  setTimeout(() => {
    const activeElement = document.activeElement as HTMLElement;
    if (activeElement) {
      activeElement.blur();
    }
  }, 0);
};
