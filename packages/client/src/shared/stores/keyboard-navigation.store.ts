import { STATES } from "@client/constants.ts";
import {
  getTasksByColumn,
  getTasksByState,
  kanbanStore,
  updateStatus,
} from "@client/features/kanban/stores/kanban.store.ts";
import { Direction } from "@client/services/taskNavigationService.ts";
import { createBaseStore } from "@client/stores/baseStore.ts";

interface KeyboardNavigationState {
  columnIndex: number;
  rowIndex: number;
  columnCount: number;
}

const { store: keyboardNavigationStore, setStore: setKeyboardNavigationStore } =
  createBaseStore<KeyboardNavigationState>({
    columnIndex: 0,
    rowIndex: 0,
    columnCount: 4,
  });

export { keyboardNavigationStore };

export const currentTask = () => {
  const taskId = getTasksByColumn(keyboardNavigationStore.columnIndex)[
    keyboardNavigationStore.rowIndex
  ];

  const task = kanbanStore.tasks.find((t) => t.id.toString() === taskId);
  return task;
};

export const moveKeyboardSelection = (direction: Direction) => {
  let columnIndex = keyboardNavigationStore.columnIndex;
  let rowIndex = keyboardNavigationStore.rowIndex;

  // move left and right
  switch (direction) {
    case Direction.Up:
      rowIndex--;
      break;
    case Direction.Down:
      rowIndex++;
      break;
  }

  const rowCount = (idx: number) => getTasksByState(STATES[idx].id).length;

  // skip empty columns
  if (direction === Direction.Left) {
    do {
      columnIndex--;
    } while (columnIndex > 0 && rowCount(columnIndex) === 0);
  } else if (direction === Direction.Right) {
    do {
      columnIndex++;
    } while (
      columnIndex < keyboardNavigationStore.columnCount &&
      rowCount(columnIndex) === 0
    );
  }

  // circle columns
  if (columnIndex < 0) {
    columnIndex = keyboardNavigationStore.columnCount;
  } else if (columnIndex > keyboardNavigationStore.columnCount) {
    columnIndex = 0;
  }

  // circle rows
  if (rowIndex < 0) {
    rowIndex = rowCount(keyboardNavigationStore.columnIndex) - 1;
  } else if (rowIndex >= rowCount(keyboardNavigationStore.columnIndex)) {
    rowIndex = 0;
  }

  if (rowIndex >= rowCount(columnIndex)) {
    rowIndex = rowCount(columnIndex) - 1;
  }

  setKeyboardNavigationStore({ columnIndex, rowIndex });
};

export const moveTask = async (direction: Direction) => {
  const taskId = getTasksByState(
    STATES[keyboardNavigationStore.columnIndex].id,
  )[keyboardNavigationStore.rowIndex]?.id;

  let columnIndex = keyboardNavigationStore.columnIndex;

  if (direction === Direction.Left && columnIndex === 0) return;
  if (direction === Direction.Right && columnIndex === STATES.length - 1)
    return;

  columnIndex += direction === Direction.Left ? -1 : 1;

  const state =
    STATES[Math.min(Math.max(columnIndex, 0), STATES.length - 1)].id;

  await updateStatus(taskId, state);

  setKeyboardNavigationStore({
    columnIndex,
  });
};
