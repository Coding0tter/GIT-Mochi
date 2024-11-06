import { createStore, reconcile } from "solid-js/store";
import { Task } from "./taskStore";

export enum ModalType {
  CreateTask,
  DeleteTask,
  TaskDetails,
  Help,
  None,
}

export const [modalStore, setModalStore] = createStore({
  activeModal: ModalType.None,
  selectedTask: null as Task | null,
  closing: false,
});

export const setActiveModal = (type: ModalType) => {
  setModalStore("activeModal", type);
};

export const setSelectedTaskForModal = (task: Partial<Task> | null) => {
  setModalStore("selectedTask", reconcile(task as Task));
};

export const setSelectedTaskValue = (key: string, value: string) => {
  setModalStore("selectedTask", {
    ...modalStore.selectedTask!,
    [key]: value,
  });
};

export const handleCloseModal = () => {
  setModalStore("closing", true);
  setTimeout(() => {
    setModalStore("activeModal", ModalType.None);
    setModalStore("selectedTask", null);
    setModalStore("closing", false);
  }, 300);
};
