import { createStore } from "solid-js/store";

interface DragState {
  taskId: string | null;
  fromColumnIndex: number | null;
}

export const [dragStore, setDragStore] = createStore<DragState>({
  taskId: null,
  fromColumnIndex: null,
});

export const setDraggedTask = (
  taskId: string | null,
  columnIndex: number | null = null,
) => {
  setDragStore("taskId", taskId);
  setDragStore("fromColumnIndex", columnIndex);
};

