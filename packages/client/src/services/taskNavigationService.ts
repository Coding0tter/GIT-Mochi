import {
  keyboardNavigationStore,
  setSelectedTaskIndex,
  setSelectedTaskIndexes,
} from "../stores/keyboardNavigationStore";
import { getColumnTasks } from "../stores/taskStore";

export enum Direction {
  Up,
  Down,
  Left,
  Right,
}

export const moveSelectionToTop = () => {
  setSelectedTaskIndex(0);
  setSelectedTaskIndexes([0]);
};

export const moveSelectionToBottom = () => {
  setSelectedTaskIndex(getColumnTasks().length - 1);
  setSelectedTaskIndexes([getColumnTasks().length - 1]);
};

export const addToSelection = (direction: Direction) => {
  const columnTasks = getColumnTasks();
  switch (direction) {
    case Direction.Up:
      setSelectedTaskIndex((prev) => Math.max(prev - 1, 0));

      setSelectedTaskIndexes((prev) => [
        ...prev.filter(
          (index) =>
            index <= prev.at(0)! ||
            index < keyboardNavigationStore.selectedTaskIndex,
        ),
        keyboardNavigationStore.selectedTaskIndex,
      ]);
      break;
    case Direction.Down:
      setSelectedTaskIndex((prev) =>
        Math.min(prev + 1, columnTasks.length - 1),
      );

      setSelectedTaskIndexes((prev) => [
        ...prev.filter(
          (index) =>
            index >= prev.at(0)! ||
            index > keyboardNavigationStore.selectedTaskIndex,
        ),
        keyboardNavigationStore.selectedTaskIndex,
      ]);
      break;
  }
};
