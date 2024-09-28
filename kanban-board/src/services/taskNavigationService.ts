import { STATES } from "../constants";
import {
  setSelectedColumnIndex,
  setSelectedTaskIndex,
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
      break;
    case Direction.Down:
      setSelectedTaskIndex((prev) => (prev + 1) % columnTasks.length);
      break;
    case Direction.Left:
      setSelectedColumnIndex(
        (prev) => (prev - 1 + STATES.length) % STATES.length
      );
      setSelectedTaskIndex(0);
      break;
    case Direction.Right:
      setSelectedColumnIndex((prev) => (prev + 1) % STATES.length);
      setSelectedTaskIndex(0);
      break;
  }
};
