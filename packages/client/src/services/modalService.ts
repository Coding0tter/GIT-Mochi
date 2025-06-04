import { STATES } from "../constants";
import { keyboardNavigationStore } from "../stores/keyboardNavigationStore";
import {
  closeModal,
  handleCloseModal,
  modalStore,
  ModalType,
  openModal,
  setSelectedAppointmentForModal,
  setSelectedTaskForModal,
} from "../stores/modalStore";
import { getColumnTasks } from "../stores/taskStore";
import { timeTrackStore } from "../stores/timeTrackStore";
import type { ITask } from "shared/types/task";

export const openHelpModal = () => {
  openModal(ModalType.Help);
};

export const openDeleteModal = () => {
  openModal(ModalType.DeleteTask);
  setSelectedTaskForModal(
    getColumnTasks()[keyboardNavigationStore.selectedTaskIndex],
  );
};

export const openCreateModal = () => {
  openModal(ModalType.CreateTask);
  setSelectedTaskForModal({
    title: "",
    description: "",
    status: STATES.at(0)!.id,
  });
};

export const openEditTaskModal = () => {
  openModal(ModalType.CreateTask);
  setSelectedTaskForModal(
    getColumnTasks()[keyboardNavigationStore.selectedTaskIndex],
  );
};

export const openEditAppointmentModal = () => {
  openModal(ModalType.EditAppointment);
  setSelectedAppointmentForModal(
    timeTrackStore.entries[keyboardNavigationStore.selectedAppointmentIndex],
  );
};

export const openDetailsModal = () => {
  setSelectedTaskForModal(
    getColumnTasks()[keyboardNavigationStore.selectedTaskIndex],
  );

  openModal(ModalType.TaskDetails);
};

export const openPipelineModal = () => {
  setSelectedTaskForModal(
    getColumnTasks()[keyboardNavigationStore.selectedTaskIndex],
  );

  openModal(ModalType.Pipeline);
};

export const openBranchNameModal = (task: ITask) => {
  setSelectedTaskForModal(task);
  openModal(ModalType.BranchName);
};

export const getTopModal = () => {
  return modalStore.activeModals?.at(-1) ?? ModalType.None;
};

export const closeTopModal = () => {
  handleCloseModal();
};
