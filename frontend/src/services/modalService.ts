import { STATES } from "../constants";
import { keyboardNavigationStore } from "../stores/keyboardNavigationStore";
import {
  ModalType,
  setActiveModal,
  setSelectedTaskForModal,
} from "../stores/modalStore";
import { getColumnTasks } from "../stores/taskStore";

export const openHelpModal = () => {
  setActiveModal(ModalType.Help);
};

export const openDeleteModal = () => {
  setActiveModal(ModalType.DeleteTask);
  setSelectedTaskForModal(
    getColumnTasks()[keyboardNavigationStore.selectedTaskIndex]
  );
};

export const openCreateModal = () => {
  setActiveModal(ModalType.CreateTask);
  setSelectedTaskForModal({
    title: "",
    description: "",
    status: STATES.at(0)!.id,
  });
};

export const openEditModal = () => {
  setActiveModal(ModalType.CreateTask);
  setSelectedTaskForModal(
    getColumnTasks()[keyboardNavigationStore.selectedTaskIndex]
  );
};

export const openDetailsModal = () => {
  setSelectedTaskForModal(
    getColumnTasks()[keyboardNavigationStore.selectedTaskIndex]
  );
  setActiveModal(ModalType.TaskDetails);
};
