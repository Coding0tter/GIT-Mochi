import { describe, expect, test } from "bun:test";
import {
  createTaskAsync,
  deleteTaskAsync,
  moveSelectedTasksAsync,
  restoreSelectedTaskAsync,
  updateTaskAsync,
} from "../taskService";
import { useSpies } from "../../../base.test";
import { Direction } from "../taskNavigationService";
import { Task } from "../../stores/taskStore";
import {
  keyboardNavigationStore,
  setSelectedColumnIndex,
  setSelectedTaskIndex,
  setSelectedTaskIndexes,
} from "../../stores/keyboardNavigationStore";
import { AxiosResponse } from "axios";

describe("TaskService", () => {
  test("should create a task", async () => {
    const { postSpy } = useSpies();

    await createTaskAsync({
      title: "Task 3",
      status: "opened",
      description: "test",
    });

    expect(postSpy).toHaveBeenCalledWith("/tasks", {
      title: "Task 3",
      status: "opened",
      description: "test",
      custom: true,
    });
  });

  test("should update a task", async () => {
    const { putSpy } = useSpies();

    await updateTaskAsync("123", {
      title: "Task 3",
      status: "opened",
      description: "test",
    });

    expect(putSpy).toHaveBeenCalledWith("/tasks/123", {
      title: "Task 3",
      status: "opened",
      description: "test",
    });
  });

  test("should delete a task", async () => {
    const { deleteSpy } = useSpies();

    await deleteTaskAsync("123");

    expect(deleteSpy).toHaveBeenCalledWith("/tasks/123");
  });

  test("should move selected tasks and keep selection", async () => {
    const { getColumnTasksSpy, filteredTasksSpy, updateTaskAsyncSpy } =
      useSpies();

    setSelectedTaskIndex(0);
    setSelectedColumnIndex(0);
    setSelectedTaskIndexes([0, 1]);

    getColumnTasksSpy.mockReturnValueOnce([
      { _id: "1", title: "Task 1", status: "opened" },
      { _id: "3", title: "Task 2", status: "opened" },
      { _id: "2", title: "Task 3", status: "inprogress" },
    ] as Task[]);

    updateTaskAsyncSpy.mockResolvedValue({ status: 200 } as AxiosResponse);

    filteredTasksSpy.mockReturnValueOnce([
      { _id: "1", title: "Task 1", status: "inprogress" },
      { _id: "2", title: "Task 2", status: "inprogress" },
      { _id: "3", title: "Task 3", status: "inprogress" },
    ] as Task[]);

    await moveSelectedTasksAsync(Direction.Right);

    expect(updateTaskAsyncSpy).toHaveBeenCalledWith("1", {
      status: "inprogress",
    });
    expect(updateTaskAsyncSpy).toHaveBeenCalledWith("3", {
      status: "inprogress",
    });

    expect(keyboardNavigationStore.selectedColumnIndex).toBe(1);
    expect(keyboardNavigationStore.selectedTaskIndex).toBe(0);
    expect(keyboardNavigationStore.selectedTaskIndexes).toEqual([0, 2]);
  });

  test("should restore selected task", async () => {
    const {
      getColumnTasksSpy,
      putSpy,
      addNotificationSpy,
      fetchTasksAsyncSpy,
    } = useSpies();

    setSelectedTaskIndex(0);
    getColumnTasksSpy.mockReturnValueOnce([
      {
        _id: "1",
        title: "Task 1",
        status: "opened",
      },
    ] as Task[]);

    await restoreSelectedTaskAsync();

    expect(putSpy).toHaveBeenCalledWith("/tasks/1/restore");

    expect(fetchTasksAsyncSpy).toHaveBeenCalled();

    expect(addNotificationSpy).toHaveBeenCalledWith({
      title: "Task restored",
      description: "Task has been restored",
      type: "success",
    });
  });

  test("should handle error when restoring task", async () => {
    const {
      getColumnTasksSpy,
      putSpy,
      addNotificationSpy,
      fetchTasksAsyncSpy,
    } = useSpies();

    setSelectedTaskIndex(0);
    getColumnTasksSpy.mockReturnValueOnce([
      {
        _id: "1",
        title: "Task 1",
        status: "opened",
      },
    ] as Task[]);

    putSpy.mockRejectedValueOnce(new Error("Failed to restore task"));

    await restoreSelectedTaskAsync();

    expect(putSpy).toHaveBeenCalledWith("/tasks/1/restore");

    expect(fetchTasksAsyncSpy).not.toHaveBeenCalled();

    expect(addNotificationSpy).toHaveBeenCalledWith({
      title: "Error",
      description: "Failed to restore task",
      type: "error",
    });
  });
});
