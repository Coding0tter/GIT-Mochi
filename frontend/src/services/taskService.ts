import axios from "axios";
import { STATES } from "../constants";
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
  setTasks,
  Task,
  taskStore,
} from "../stores/taskStore";
import { addNotification } from "./notificationService";
import { Direction } from "./taskNavigationService";
import { orderBy } from "lodash";

export const restoreSelectedTaskAsync = async () => {
  try {
    const taskId =
      getColumnTasks()[keyboardNavigationStore.selectedTaskIndex]._id;

    await axios.patch(`/tasks/${taskId}`);

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
  } catch (error) {
    addNotification({
      title: "Error",
      description: "Failed to update task",
      type: "error",
    });
  }
};

export const updateTaskOrderAsync = async (taskOrder: string[]) => {
  try {
    const res = await axios.put(`/tasks/order`, { taskOrder });
    return res;
  } catch (error) {
    addNotification({
      title: "Error",
      description: "Failed to update task order",
      type: "error",
    });
  }
};

export const deleteTasksAsync = async (taskIndexes: number[]) => {
  const tasks = getColumnTasks();
  const ids = taskIndexes.map((index) => tasks[index]._id);

  await axios.delete(`/tasks/${ids.join(",")}`);
};

export const moveSelectedTasksAsync = async (direction: Direction) => {
  const { selectedColumnIndex, selectedTaskIndexes } = keyboardNavigationStore;
  const tasksToMove = getColumnTasks().filter((_task, index) =>
    selectedTaskIndexes.includes(index),
  );

  if (direction === Direction.Left || direction === Direction.Right) {
    await moveSelectedTasksToColumn(
      tasksToMove,
      selectedColumnIndex,
      direction,
    );
  } else if (direction === Direction.Up || direction === Direction.Down) {
    await moveSelectedTasksInColumn(tasksToMove, direction);
  }
};

export const moveSelectedTasksToEndAsync = async (direction: Direction) => {
  const { selectedTaskIndexes } = keyboardNavigationStore;
  const tasks = getColumnTasks();
  const selectedTasks = tasks.filter((_task, index) =>
    selectedTaskIndexes.includes(index),
  );

  // Remove selected tasks from the original array
  const remainingTasks = tasks.filter(
    (_task, index) => !selectedTaskIndexes.includes(index),
  );

  // Rebuild the task array based on the direction
  const newTaskOrder =
    direction === Direction.Up
      ? [...selectedTasks, ...remainingTasks]
      : [...remainingTasks, ...selectedTasks];

  // Reassign orders based on the new position
  const updatedTaskOrder = newTaskOrder.map((task, index) => ({
    ...task,
    order: index,
  }));

  // Extract IDs for the backend update
  const updatedTaskIds = updatedTaskOrder.map((task) => task._id);

  await updateTaskOrderAsync(updatedTaskIds);
  await fetchTasksAsync();

  // Reset selection
  const newSelectedIndexes =
    direction === Direction.Up
      ? selectedTasks.map((_task, index) => index)
      : selectedTasks.map(
          (_task, index) => newTaskOrder.length - selectedTasks.length + index,
        );

  setSelectedTaskIndexes(newSelectedIndexes);
  setSelectedTaskIndex(
    direction === Direction.Up ? 0 : newTaskOrder.length - 1,
  );
};

const moveSelectedTasksToColumn = async (
  tasksToMove: Task[],
  selectedColumnIndex: number,
  direction: Direction,
) => {
  const newStatusIndex =
    direction === Direction.Right
      ? Math.min(selectedColumnIndex + 1, STATES.length - 1)
      : Math.max(selectedColumnIndex - 1, 0);

  const results = await Promise.all(
    tasksToMove.map((task) =>
      updateTaskAsync(task._id, { status: STATES[newStatusIndex].id }),
    ),
  );

  if (results.every((res) => res?.status === 200)) {
    const newTasks = taskStore.tasks.map((task) => {
      if (tasksToMove.some((t) => t._id === task._id)) {
        return { ...task, status: STATES[newStatusIndex].id };
      }
      return task;
    });

    document.startViewTransition(() => {
      setTasks(newTasks);

      const newColumnTasks = filteredTasks().filter(
        (task) => task.status === STATES[newStatusIndex].id,
      );

      const movedTaskIndexes = tasksToMove.map((task) =>
        newColumnTasks.findIndex((t) => t._id === task._id),
      );

      setSelectedColumnIndex(newStatusIndex);
      setSelectedTaskIndex(movedTaskIndexes[0]);
      setSelectedTaskIndexes(movedTaskIndexes);
    });
  }
};

const moveSelectedTasksInColumn = async (
  tasksToMove: Task[],
  direction: Direction,
) => {
  const columnTasks = getColumnTasks();
  const sortedTasks = [...tasksToMove].sort((a, b) => a.order - b.order);
  const shift = direction === Direction.Up ? -1 : 1;
  const newTaskOrder = columnTasks.map((task) => ({ ...task }));

  const firstTask = sortedTasks[0];
  const lastTask = sortedTasks[sortedTasks.length - 1];

  const newFirstOrder = firstTask.order + shift;
  const newLastOrder = lastTask.order + shift;

  if (newFirstOrder < 0 || newLastOrder >= columnTasks.length) {
    return;
  }

  if (direction === Direction.Down) {
    const lastIndex = newTaskOrder.findIndex((t) => t._id === lastTask._id);

    if (lastIndex === newTaskOrder.length - 1) {
      return;
    }

    newTaskOrder[lastIndex + 1].order = firstTask.order;
  } else if (direction === Direction.Up) {
    const firstIndex = newTaskOrder.findIndex((t) => t._id === firstTask._id);

    if (firstIndex === 0) {
      return;
    }

    newTaskOrder[firstIndex - 1].order = lastTask.order;
  }

  sortedTasks.forEach((task) => {
    const newOrder = task.order + shift;
    const taskIndex = newTaskOrder.findIndex((t) => t._id === task._id);

    if (taskIndex !== -1) {
      newTaskOrder[taskIndex] = { ...task, order: newOrder };
    }
  });

  const updatedTaskOrder = orderBy(newTaskOrder, "order").map(
    (task) => task._id,
  );

  await updateTaskOrderAsync(updatedTaskOrder);
  await fetchTasksAsync();

  const movedTaskIndexes = sortedTasks.map(
    (task) => newTaskOrder.findIndex((t) => t._id === task._id) + shift,
  );

  setSelectedTaskIndexes(movedTaskIndexes);
  setSelectedTaskIndex(movedTaskIndexes[0]);
};
