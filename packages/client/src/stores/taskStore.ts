import { createStore, reconcile } from "solid-js/store";
import { STATES } from "../constants";
import { addNotification } from "../services/notificationService";
import { InputMode, LoadingTarget, setLoading, uiStore } from "./uiStore";
import { keyboardNavigationStore } from "./keyboardNavigationStore";
import { syncGitlabAsync } from "../services/gitlabService";
import axios from "axios";
import { orderBy } from "lodash";
import Fuse, { type IFuseOptions } from "fuse.js";
import type { ITask, IComment } from "shared/types/task";
import { orderPriorityLabels } from "@client/utils/orderLabels";

interface TaskStore {
  tasks: Partial<ITask>[];
  showDeleted: boolean;
}

export const [taskStore, setTaskStore] = createStore<TaskStore>({
  tasks: [],
  showDeleted: false,
});

export const getColumnTasks = () => {
  const tasks = filteredTasks().filter(
    (task) =>
      task.status === STATES[keyboardNavigationStore.selectedColumnIndex].id,
  );
  if (keyboardNavigationStore.selectedColumnIndex === 0) {
    return orderBy(
      tasks.filter(
        (item) => item.assignee?.authorId === uiStore.user?.gitlabId,
      ),
      (task) => {
        const priorityLabel = orderPriorityLabels(task.labels ?? [])
          .at(0)
          ?.toLowerCase();

        if (priorityLabel?.includes("intermediate")) return 1;
        if (priorityLabel?.includes("staging")) return 2;
        if (priorityLabel?.includes("high")) return 3;
        if (priorityLabel?.includes("medium")) return 4;
        if (priorityLabel?.includes("low")) return 5;
        return 6;
      },
    );
  }

  return tasks;
};

export const updateComments = (
  values: { taskId: string; comments: IComment[] }[],
) => {
  setTaskStore("tasks", (tasks: Partial<ITask>[]) =>
    tasks.map((task: Partial<ITask>) => {
      const updatedValue = values.find((value) => value.taskId === task._id);

      return updatedValue ? { ...task, comments: updatedValue.comments } : task;
    }),
  );
};

export const updateDiscussions = (
  values: { taskId: string; discussions: any[] }[],
) => {
  setTaskStore("tasks", (tasks: Partial<ITask>[]) =>
    tasks.map((task: Partial<ITask>) => {
      const updatedValue = values.find((value) => value.taskId === task._id);
      return updatedValue
        ? { ...task, discussions: updatedValue.discussions }
        : task;
    }),
  );
};

export const setTasks = (tasks: ITask[]) => {
  setTaskStore("tasks", tasks);
};

export const updateTasks = (values: ITask[]) => {
  const updatedTasks = taskStore.tasks.map((task) => {
    const updatedValue = values.find((value) => value._id === task._id);
    return updatedValue ? { ...task, ...updatedValue } : task;
  });

  const newTasks = values.filter(
    (value) => !taskStore.tasks.some((task) => task._id === value._id),
  );

  setTaskStore("tasks", reconcile([...updatedTasks, ...newTasks]));
};

export const fetchTasksAsync = async (): Promise<ITask[]> => {
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

  // First, check for exact matches in several fields.
  const exactBranchMatches = taskStore.tasks.filter((task) =>
    task.branch?.toLowerCase().includes(searchQuery),
  );

  const exactTitleMatches = taskStore.tasks.filter((task) =>
    task.title?.toLowerCase().includes(searchQuery),
  );

  const exactGitlabIidMatches = taskStore.tasks.filter(
    (task) =>
      task.type === "issue" &&
      task.gitlabIid?.toString().toLowerCase() === searchQuery,
  );

  // Combine the exact match arrays without duplicates.
  const exactMatches = Array.from(
    new Set([
      ...exactBranchMatches,
      ...exactTitleMatches,
      ...exactGitlabIidMatches,
    ]),
  );

  if (exactMatches.length > 0) {
    return orderBy(exactMatches, "order");
  }

  // Fallback to fuzzy search if no exact match is found.
  const options: IFuseOptions<Partial<ITask>> = {
    includeScore: true,
    keys: [
      "title",
      {
        name: "gitlabIid",
        getFn: (task: any) =>
          task.type === "issue" ? task.gitlabIid?.toString() : "",
      },
      "branch", // You may include branch for fuzzy search as well.
    ],
    // Use a stricter threshold so that only slight typos trigger fuzzy matching.
    threshold: 0.4,
  };

  const fuse = new Fuse(taskStore.tasks, options);
  const results = fuse.search(searchQuery).map((result) => result.item);

  return orderBy(results, "order");
};
