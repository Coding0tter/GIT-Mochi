import { describe, expect, test } from "bun:test";
import {
  addToSelection,
  Direction,
  moveSelection,
} from "../taskNavigationService";
import { useSpies } from "../../../base.test";
import { Task } from "../../stores/taskStore";
import {
  keyboardNavigationStore,
  setSelectedColumnIndex,
  setSelectedTaskIndex,
  setSelectedTaskIndexes,
} from "../../stores/keyboardNavigationStore";
import { STATES } from "../../constants";

const mockTasks = [
  { title: "Task 1", status: "opened" },
  { title: "Task 2", status: "opened" },
  { title: "Task 3", status: "inprogress" },
  { title: "Task 4", status: "done" },
  { title: "Task 5", status: "review" },
  { title: "Task 6", status: "closed" },
] as Task[];

describe("TaskNavigationService", () => {
  test("should move selection up", () => {
    const { getColumnTasksSpy } = useSpies();

    getColumnTasksSpy.mockReturnValueOnce(mockTasks);
    setSelectedTaskIndex(1);
    setSelectedColumnIndex(0);

    moveSelection(Direction.Up);

    expect(keyboardNavigationStore.selectedTaskIndex).toBe(0);
    expect(keyboardNavigationStore.selectedColumnIndex).toBe(0);
    expect(keyboardNavigationStore.selectedTaskIndexes).toEqual([0]);
  });

  test("should move selection down", () => {
    const { getColumnTasksSpy } = useSpies();

    getColumnTasksSpy.mockReturnValueOnce(mockTasks);
    setSelectedTaskIndex(0);
    setSelectedColumnIndex(0);

    moveSelection(Direction.Down);

    expect(keyboardNavigationStore.selectedTaskIndex).toBe(1);
    expect(keyboardNavigationStore.selectedColumnIndex).toBe(0);
    expect(keyboardNavigationStore.selectedTaskIndexes).toEqual([1]);
  });

  test("should move selection right", () => {
    const { getColumnTasksSpy } = useSpies();

    getColumnTasksSpy.mockReturnValueOnce(mockTasks);
    setSelectedTaskIndex(0);
    setSelectedColumnIndex(0);

    moveSelection(Direction.Right);

    expect(keyboardNavigationStore.selectedTaskIndex).toBe(0);
    expect(keyboardNavigationStore.selectedColumnIndex).toBe(1);
    expect(keyboardNavigationStore.selectedTaskIndexes).toEqual([0]);
  });

  test("should move selection left", () => {
    const { getColumnTasksSpy, filteredTasksSpy } = useSpies();

    setSelectedTaskIndex(0);
    setSelectedColumnIndex(0);
    getColumnTasksSpy.mockReturnValue(mockTasks);
    filteredTasksSpy.mockReturnValue(mockTasks);

    moveSelection(Direction.Left);

    expect(keyboardNavigationStore.selectedTaskIndex).toBe(0);
    expect(keyboardNavigationStore.selectedColumnIndex).toBe(STATES.length - 1);
    expect(keyboardNavigationStore.selectedTaskIndexes).toEqual([0]);
  });

  test("should add top tasks to selection", () => {
    const { getColumnTasksSpy } = useSpies();

    getColumnTasksSpy.mockReturnValueOnce(mockTasks);
    setSelectedTaskIndex(1);
    setSelectedTaskIndexes([1]);

    addToSelection(Direction.Up);

    expect(keyboardNavigationStore.selectedTaskIndex).toBe(0);
    expect(keyboardNavigationStore.selectedTaskIndexes).toEqual([1, 0]);
  });

  test("should add bottom tasks to selection", () => {
    const { getColumnTasksSpy } = useSpies();

    getColumnTasksSpy.mockReturnValueOnce(mockTasks);
    setSelectedTaskIndex(0);
    setSelectedTaskIndexes([0]);

    addToSelection(Direction.Down);

    expect(keyboardNavigationStore.selectedTaskIndex).toBe(1);
    expect(keyboardNavigationStore.selectedTaskIndexes).toEqual([0, 1]);
  });
});
