import { set } from "lodash";
import { STATES } from "../constants";
import {
  keyboardNavigationStore,
  setSelectedColumnIndex,
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

export const moveSelection = async (direction: Direction) => {
  const columnTasks = getColumnTasks();
  switch (direction) {
    case Direction.Up:
      setSelectedTaskIndex(
        (prev) => (prev - 1 + columnTasks.length) % columnTasks.length
      );
      setSelectedTaskIndexes([keyboardNavigationStore.selectedTaskIndex]);
      break;
    case Direction.Down:
      setSelectedTaskIndex((prev) => (prev + 1) % columnTasks.length);
      setSelectedTaskIndexes([keyboardNavigationStore.selectedTaskIndex]);

      break;
    case Direction.Left:
      setSelectedColumnIndex(
        (prev) => (prev - 1 + STATES.length) % STATES.length
      );
      setSelectedTaskIndexes([0]);
      setSelectedTaskIndex(0);
      break;
    case Direction.Right:
      setSelectedColumnIndex((prev) => (prev + 1) % STATES.length);
      setSelectedTaskIndex(0);
      setSelectedTaskIndexes([0]);
      break;
  }
};

export const addToSelection = async (direction: Direction) => {
  const columnTasks = getColumnTasks();
  switch (direction) {
    case Direction.Up:
      setSelectedTaskIndex((prev) => Math.max(prev - 1, 0));

      setSelectedTaskIndexes((prev) => [
        ...prev.filter(
          (index) =>
            index <= prev.at(0)! ||
            index < keyboardNavigationStore.selectedTaskIndex
        ),
        keyboardNavigationStore.selectedTaskIndex,
      ]);
      break;
    case Direction.Down:
      setSelectedTaskIndex((prev) =>
        Math.min(prev + 1, columnTasks.length - 1)
      );

      setSelectedTaskIndexes((prev) => [
        ...prev.filter(
          (index) =>
            index >= prev.at(0)! ||
            index > keyboardNavigationStore.selectedTaskIndex
        ),
        keyboardNavigationStore.selectedTaskIndex,
      ]);
      break;
  }
};
