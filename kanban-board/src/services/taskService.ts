import { BACKEND_URL, STATES } from "../constants";
import {
  keyboardNavigationStore,
  setSelectedColumnIndex,
  setSelectedTaskIndex,
} from "../stores/keyboardNavigationStore";
import { fetchTasksAsync, getColumnTasks, Task } from "../stores/taskStore";
import { addNotification } from "./notificationService";
import { Direction } from "./taskNavigationService";

export const restoreSelectedTaskAsync = async () => {
  try {
    const taskId =
      getColumnTasks()[keyboardNavigationStore.selectedTaskIndex]._id;

    await fetch(`${BACKEND_URL}/tasks/${taskId}/restore`, {
      method: "PUT",
    });

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
  const res = await fetch(`${BACKEND_URL}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: task.title,
      status: task.status,
      description: task.description,
      custom: true,
    }),
  });
  return await res.json();
};

export const updateTaskAsync = async (taskId: string, task: Partial<Task>) => {
  try {
    const res = await fetch(`${BACKEND_URL}/tasks/${taskId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(task),
    });
    return res;
  } catch (error) {
    console.error("Failed to update task:", error);
  }
};

export const deleteTaskAsync = async (taskId: string) => {
  await fetch(`${BACKEND_URL}/tasks/${taskId}`, { method: "DELETE" });
};

export const moveTaskAsync = async (direction: Direction) => {
  const columnTasks = getColumnTasks();
  const newStatusIndex =
    direction === Direction.Right
      ? Math.min(
          keyboardNavigationStore.selectedColumnIndex + 1,
          STATES.length - 1
        )
      : Math.max(keyboardNavigationStore.selectedColumnIndex - 1, 0);

  const taskToMove = columnTasks[keyboardNavigationStore.selectedTaskIndex];
  if (
    (
      await updateTaskAsync(taskToMove._id, {
        status: STATES[newStatusIndex].id,
      })
    )?.ok
  ) {
    const result = await fetchTasksAsync();

    const newColumnTasks = result.filter(
      (task) => task.status === STATES[newStatusIndex].id
    );
    const movedTaskIndex = newColumnTasks.findIndex(
      (task) => task._id === taskToMove._id
    );

    setSelectedColumnIndex(newStatusIndex);
    setSelectedTaskIndex(movedTaskIndex);
  }
};
