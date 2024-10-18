import { createStore } from "solid-js/store";
import { STATES } from "../constants";
import { addNotification } from "../services/notificationService";
import { InputMode, setLoading, uiStore } from "./uiStore";
import { keyboardNavigationStore } from "./keyboardNavigationStore";
import { syncGitlabAsync } from "../services/gitlabService";
import axios from "axios";
import { orderBy } from "lodash";

export interface Comment {
  body: string;
  images?: string[];
  resolved: boolean;
  author: {
    name: string;
    username: string;
  };
  system: boolean;
}

export interface Task {
  _id: string;
  gitlabId?: string;
  gitlabIid?: string;
  title: string;
  description: string;
  web_url: string;
  status: string;
  type?: string;
  comments: Comment[];
  order: number;
  custom?: boolean;
  branch: string;
  deleted: boolean;
  labels: string[];
  milestoneName?: string;
}

export const [taskStore, setTaskStore] = createStore({
  tasks: [] as Task[],
  showDeleted: false,
});

export const getColumnTasks = () => {
  return filteredTasks().filter(
    (task) =>
      task.status === STATES[keyboardNavigationStore.selectedColumnIndex].id
  );
};

export const updateComments = (
  values: { taskId: string; comments: Comment[] }[]
) => {
  setTaskStore("tasks", (tasks) =>
    tasks.map((task) => {
      const updatedValue = values.find((value) => value.taskId === task._id);
      return updatedValue ? { ...task, comments: updatedValue.comments } : task;
    })
  );
};

export const updateTasks = (values: Task[]) => {
  setTaskStore("tasks", (tasks) => {
    const updatedTasks = tasks.map((task) => {
      const updatedValue = values.find((value) => value._id === task._id);
      return updatedValue ? updatedValue : task;
    });

    const newTasks = values.filter(
      (value) => !tasks.some((task) => task._id === value._id)
    );

    return [...updatedTasks, ...newTasks];
  });
};

export const fetchTasksAsync = async (
  showDeleted: boolean = false
): Promise<Task[]> => {
  const res = await axios.get(`/tasks?showDeleted=${showDeleted}`);
  const response = res.data;

  if (response.error) {
    addNotification({
      title: "Error",
      description: response.error,
      type: "error",
      duration: 5000,
    });

    setTaskStore("tasks", []);
    return [];
  }

  setTaskStore("tasks", response);
  return response;
};

export const toggleShowDeletedTasksAsync = async () => {
  setLoading(true);
  await fetchTasksAsync(!taskStore.showDeleted);
  setTaskStore("showDeleted", !taskStore.showDeleted);
  setLoading(false);
};

export const handleGitlabSyncAsync = async () => {
  setLoading(true);
  await syncGitlabAsync();
  await fetchTasksAsync();
  setLoading(false);
};

export const filteredTasks = () => {
  const searchQuery = uiStore.commandInputValue.toLowerCase();

  if (uiStore.inputMode !== InputMode.Search || !searchQuery) {
    return orderBy(taskStore.tasks, "order");
  }

  const filteredTasks = taskStore.tasks.filter(
    (task) =>
      task.title.toLowerCase().includes(searchQuery) ||
      task.labels.some((label) => label.toLowerCase().includes(searchQuery)) ||
      task.branch?.toString().includes(searchQuery) ||
      (task.type === "issue" &&
        task.gitlabIid?.toString().includes(searchQuery))
  );

  return orderBy(filteredTasks, "order");
};
