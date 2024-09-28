import { createStore } from "solid-js/store";

export const [keyboardNavigationStore, setKeyboardNavigationStore] =
  createStore({
    selectedColumnIndex: 0,
    selectedTaskIndex: 0,
  });

export const setSelectedColumnIndex = (
  updater: number | ((prev: number) => number)
) => {
  const prevIndex = keyboardNavigationStore.selectedColumnIndex;

  const newIndex = typeof updater === "function" ? updater(prevIndex) : updater;

  setKeyboardNavigationStore("selectedColumnIndex", newIndex);
};

export const setSelectedTaskIndex = (
  updater: number | ((prev: number) => number)
) => {
  const prevIndex = keyboardNavigationStore.selectedTaskIndex;

  const newIndex = typeof updater === "function" ? updater(prevIndex) : updater;

  setKeyboardNavigationStore("selectedTaskIndex", newIndex);
};
