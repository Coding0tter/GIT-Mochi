import axios from "axios";
import {  STATES } from "../constants";
import {
  keyboardNavigationStore,
  setSelectedColumnIndex,
  setSelectedTaskIndex,
  setSelectedTaskIndexes,
} from "../stores/keyboardNavigationStore";
import {
  fetchTasksAsync,
  filteredTasks,
  getColumnTasks,
  Task,
} from "../stores/taskStore";
import { addNotification } from "./notificationService";
import { Direction } from "./taskNavigationService";

export const restoreSelectedTaskAsync = async () => {
  try {
    const taskId =
      getColumnTasks()[keyboardNavigationStore.selectedTaskIndex]._id;

    await axios.put(`/tasks/${taskId}/restore`);

    await fetchTasksAsync();

    addNotification({
      title: "Task restored",
      description: "Task has been restored",
      type: "success",
    });
  } catch (error) {
    addNotification({
      title: "Error",
      description: "Failed to restore task",
      type: "error",
    });
  }
};

export const createTaskAsync = async (task: Partial<Task>) => {
  const res = await axios.post(`/tasks`, {
    title: task.title,
    status: task.status,
    description: task.description,
    custom: true,
  });
  return res.data;
};

export const updateTaskAsync = async (taskId: string, task: Partial<Task>) => {
  try {
    const res = await axios.put(`/tasks/${taskId}`, task);
    return res;
  } catch (error) {}
};

export const deleteTaskAsync = async (taskId: string) => {
  await axios.delete(`/tasks/${taskId}`);
};

export const moveSelectedTasksAsync = async (direction: Direction) => {
  const { selectedColumnIndex, selectedTaskIndexes } = keyboardNavigationStore;
  const newStatusIndex =
    direction === Direction.Right
      ? Math.min(selectedColumnIndex + 1, STATES.length - 1)
      : Math.max(selectedColumnIndex - 1, 0);

  const tasksToMove = getColumnTasks().filter((_task, index) =>
    selectedTaskIndexes.includes(index)
  );

  const results = await Promise.all(
    tasksToMove.map((task) =>
      updateTaskAsync(task._id, { status: STATES[newStatusIndex].id })
    )
  );

  if (results.every((res) => res?.status === 200)) {
    await fetchTasksAsync();

    const newColumnTasks = filteredTasks().filter(
      (task) => task.status === STATES[newStatusIndex].id
    );

    const movedTaskIndexes = tasksToMove.map((task) =>
      newColumnTasks.findIndex((t) => t._id === task._id)
    );

    setSelectedColumnIndex(newStatusIndex);
    setSelectedTaskIndex(movedTaskIndexes[0]);
    setSelectedTaskIndexes(movedTaskIndexes);
  }
};
