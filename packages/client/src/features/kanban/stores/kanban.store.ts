import { createBaseStore } from "@client/stores/baseStore.ts";
import type { ITaskV2 } from "shared/types";
import {
  fetchTasks as fetchTasksApi,
  updateStatus as updateStatusApi,
  markTaskAsRead as markTaskAsReadApi,
} from "../services/task.service.ts";
import { LoadingTarget } from "@client/stores/uiStore.ts";
import { STATES } from "@client/constants.ts";
import { userStore } from "@client/shared/stores/user.store.ts";
import { ModalType, openModal } from "@client/shared/stores/modal.store.ts";
import { commandlineStore } from "@client/shared/stores/commandline.store.ts";

type ColumnData = {
  id: string;
  title: string;
  taskIds: string[];
};

interface KanbanState {
  columns: ColumnData[];
  tasks: ITaskV2[];
  task?: ITaskV2;
}

const {
  store: kanbanStore,
  setStore: setKanbanStore,
  run,
} = createBaseStore<KanbanState>({
  tasks: [],
  columns: [],
});

export { kanbanStore };

export const getTasksByState = (stateId: string) => {
  const search = commandlineStore.input.toLocaleLowerCase().trim();
  const column = kanbanStore.columns.find((col) => col.id === stateId);
  if (!column) return [];

  const tasks = !search
    ? kanbanStore.tasks
    : kanbanStore.tasks.filter(
        (item) =>
          item.title.toLocaleLowerCase().includes(search) ||
          item.iid.toString().includes(search) ||
          item.merge_requests?.some(
            (mr) =>
              mr.title.toLocaleLowerCase().includes(search) ||
              mr.iid.toString().includes(search),
          ),
      );

  return column.taskIds
    .map((id) => tasks.find((task) => task.id.toString() === id))
    .filter((task): task is ITaskV2 => task !== undefined);
};

export const getTasksByColumn = (columnIndex: number) => {
  return kanbanStore.columns[columnIndex]?.taskIds;
};

export const initializeBoard = async () => {
  await fetchTasks();

  updateBoard();
};

export const updateBoard = () => {
  setKanbanStore(
    "columns",
    STATES.map((state) => ({
      id: state.id,
      title: state.display_name,
      taskIds: kanbanStore.tasks
        .filter((task) => task.status === state.id)
        .map((task) => task.id.toString()),
    })),
  );
};

export const openDetailModal = (taskId: number) => {
  const task = kanbanStore.tasks.find((t) => t.id === taskId);
  if (!task) return;

  setKanbanStore({
    task,
  });

  openModal(ModalType.DetailView);
};

export const fetchTasks = async () => {
  return await run(
    async () => {
      const tasks = await fetchTasksApi();
      setKanbanStore({ tasks });

      return tasks;
    },
    {
      action: "fetchTasks",
      loadingTarget: LoadingTarget.LoadTasks,
    },
  );
};

export const updateColumns = (columns: ColumnData[]) => {
  setKanbanStore("columns", columns);
};

export const updateStatus = async (taskId: number, newStatus: string) => {
  await run(async () => {
    const task = kanbanStore.tasks.find((t) => t.id === taskId);
    if (!task) return;

    await updateStatusApi(taskId, newStatus);
  });
};

export const markTaskAsRead = async (taskId: number) => {
  await run(async () => {
    const task = kanbanStore.tasks.find((t) => t.id === taskId);
    if (!task || !task.notify) return;
    await markTaskAsReadApi(taskId);
  });
};

export const updateTasks = (tasks: ITaskV2[]) => {
  const relevantTasks = tasks.filter(
    (task) =>
      task.assignees.some((item) => item.id === userStore.user?.id) ||
      task.merge_requests?.some(
        (mr) =>
          mr.assignees.some((item) => item.id === userStore.user?.id) ||
          mr.reviewers.some((item) => item.id === userStore.user?.id),
      ),
  );

  const updatedTasks = [...kanbanStore.tasks];

  relevantTasks.forEach((task) => {
    const index = updatedTasks.findIndex((t) => t.id === task.id);

    if (index !== -1) {
      updatedTasks[index] = task;
    } else {
      updatedTasks.push(task);
    }
  });

  setKanbanStore("tasks", updatedTasks);
  updateBoard();
};
