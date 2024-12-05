import { STATES } from "../constants";
import { keyboardNavigationStore } from "../stores/keyboardNavigationStore";
import {
  ModalType,
  setActiveModal,
  setSelectedAppointmentForModal,
  setSelectedTaskForModal,
} from "../stores/modalStore";
import { getColumnTasks } from "../stores/taskStore";
import { timeTrackStore } from "../stores/timeTrackStore";

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

export const openEditTaskModal = () => {
  setActiveModal(ModalType.CreateTask);
  setSelectedTaskForModal(
    getColumnTasks()[keyboardNavigationStore.selectedTaskIndex]
  );
};

export const openEditAppointmentModal = () => {
  setActiveModal(ModalType.EditAppointment);
  setSelectedAppointmentForModal(
    timeTrackStore.entries[keyboardNavigationStore.selectedAppointmentIndex]
  );
};

export const openDetailsModal = () => {
  setSelectedTaskForModal(
    getColumnTasks()[keyboardNavigationStore.selectedTaskIndex]
  );
  setActiveModal(ModalType.TaskDetails);
};

export const openPipelineModal = () => {
  setSelectedTaskForModal(
    getColumnTasks()[keyboardNavigationStore.selectedTaskIndex]
  );
  setActiveModal(ModalType.Pipeline);
};
