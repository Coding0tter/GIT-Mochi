import { STATES } from "../constants";
import {
  keyboardNavigationStore,
  setSelectedColumnIndex,
  setSelectedTaskIndex,
  setSelectedTaskIndexes,
} from "../stores/keyboardNavigationStore";
import { filteredTasks, getColumnTasks } from "../stores/taskStore";

export enum Direction {
  Up,
  Down,
  Left,
  Right,
}

export const moveSelection = (direction: Direction) => {
  const columnTasks = getColumnTasks();
  switch (direction) {
    case Direction.Up:
      setSelectedTaskIndex(
        (prev) => (prev - 1 + columnTasks.length) % columnTasks.length,
      );
      setSelectedTaskIndexes([keyboardNavigationStore.selectedTaskIndex]);
      break;
    case Direction.Down:
      setSelectedTaskIndex((prev) => (prev + 1) % columnTasks.length);
      setSelectedTaskIndexes([keyboardNavigationStore.selectedTaskIndex]);

      break;
    case Direction.Left:
      do {
        setSelectedColumnIndex(
          (prev) => (prev - 1 + STATES.length) % STATES.length,
        );
      } while (filteredTasks().length > 0 && getColumnTasks().length === 0);
      setSelectedTaskIndexes([0]);
      setSelectedTaskIndex(0);
      break;
    case Direction.Right:
      do {
        setSelectedColumnIndex((prev) => (prev + 1) % STATES.length);
      } while (filteredTasks().length > 0 && getColumnTasks().length === 0);
      setSelectedTaskIndex(0);
      setSelectedTaskIndexes([0]);
      break;
  }
};

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
