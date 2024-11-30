import { createStore, reconcile } from "solid-js/store";
import { STATES } from "../constants";
import { addNotification } from "../services/notificationService";
import { InputMode, LoadingTarget, setLoading, uiStore } from "./uiStore";
import { keyboardNavigationStore } from "./keyboardNavigationStore";
import { syncGitlabAsync } from "../services/gitlabService";
import axios from "axios";
import { orderBy } from "lodash";
import Fuse, { IFuseOptions } from "fuse.js";

export interface Comment {
  body: string;
  images?: string[];
  resolved: boolean;
  author: {
    name: string;
    username: string;
    avatar_url: string;
  };
  created_at?: string;
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
  const tasks = filteredTasks().filter(
    (task) =>
      task.status === STATES[keyboardNavigationStore.selectedColumnIndex].id
  );
  if (keyboardNavigationStore.selectedColumnIndex === 0) {
    return orderBy(tasks, (task) => {
      const priorityLabel = task.labels
        .find((label) => label.includes("priority"))
        ?.toLowerCase();
      if (priorityLabel?.includes("high")) return 1;
      if (priorityLabel?.includes("medium")) return 2;
      if (priorityLabel?.includes("low")) return 3;
      return 4;
    });
  }

  return tasks;
};

export const updateComments = (
  values: { taskId: string; comments: Comment[] }[]
) => {
  setTaskStore("tasks", (tasks: Task[]) =>
    tasks.map((task: Task) => {
      const updatedValue = values.find((value) => value.taskId === task._id);
      return updatedValue ? { ...task, comments: updatedValue.comments } : task;
    })
  );
};

export const setTasks = (tasks: Task[]) => {
  setTaskStore("tasks", tasks);
};

export const updateTasks = (values: Task[]) => {
  const updatedTasks = taskStore.tasks.map((task) => {
    const updatedValue = values.find((value) => value._id === task._id);
    return updatedValue ? { ...task, ...updatedValue } : task;
  });

  const newTasks = values.filter(
    (value) => !taskStore.tasks.some((task) => task._id === value._id)
  );

  setTaskStore("tasks", reconcile([...updatedTasks, ...newTasks]));
};

export const fetchTasksAsync = async (): Promise<Task[]> => {
  const res = await axios.get(`/tasks?showDeleted=${taskStore.showDeleted}`);
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
  setLoading(LoadingTarget.LoadTasks);
  setTaskStore("showDeleted", !taskStore.showDeleted);
  await fetchTasksAsync();
  setLoading(LoadingTarget.None);
};

export const handleGitlabSyncAsync = async () => {
  setLoading(LoadingTarget.SyncGitlab);
  await syncGitlabAsync();
  await fetchTasksAsync();
  setLoading(LoadingTarget.None);
};

export const filteredTasks = () => {
  const searchQuery = uiStore.commandInputValue.toLowerCase();

  if (uiStore.inputMode !== InputMode.Search || !searchQuery) {
    return orderBy(taskStore.tasks, "order");
  }

  const exactMatchTasks = taskStore.tasks.filter(
    (task) => task.branch?.toLowerCase() === searchQuery
  );

  if (exactMatchTasks.length > 0) {
    return orderBy(exactMatchTasks, "order");
  }

  const options: IFuseOptions<Task> = {
    includeScore: true,
    keys: [
      "title",
      {
        name: "gitlabIid",
        getFn: (task: any) =>
          task.type === "issue" ? task.gitlabIid?.toString() : "",
      },
    ],
    threshold: 0.6,
  };

  const fuse = new Fuse(taskStore.tasks, options);
  const results = fuse.search(searchQuery).map((result) => result.item);

  return orderBy(results, "order");
};
