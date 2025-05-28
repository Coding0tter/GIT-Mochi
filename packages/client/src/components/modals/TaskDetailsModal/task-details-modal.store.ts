import { createStore } from "solid-js/store";

export const [taskDetailsModalStore, setTaskDetailsModalStore] = createStore({
  isThreadFocused: false,
  showSystem: false,
  showResolved: false,
});

export const toggleSystemDiscussions = () => {
  setTaskDetailsModalStore("showSystem", (prev) => !prev);
};

export const toggleResolvedDiscussions = () => {
  setTaskDetailsModalStore("showResolved", (prev) => !prev);
};

export const toggleThreadFocus = () => {
  setTaskDetailsModalStore("isThreadFocused", (prev) => !prev);
};
