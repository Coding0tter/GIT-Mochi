import { STATES } from "../constants";
import { keyboardNavigationStore } from "../stores/keyboardNavigationStore";
import {
  ModalType,
  openModal,
  setActiveModal,
  setSelectedAppointmentForModal,
  setSelectedTaskForModal,
} from "../stores/modalStore";
import { getColumnTasks } from "../stores/taskStore";
import { timeTrackStore } from "../stores/timeTrackStore";

export const openHelpModal = () => {
  openModal(ModalType.Help);
};

export const openFeedbackModal = () => {
  openModal(ModalType.Feedback);
};

export const openDeleteModal = () => {
  openModal(ModalType.DeleteTask);
  setSelectedTaskForModal(
    getColumnTasks()[keyboardNavigationStore.selectedTaskIndex]
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
    getColumnTasks()[keyboardNavigationStore.selectedTaskIndex]
  );
};

export const openEditAppointmentModal = () => {
  openModal(ModalType.EditAppointment);
  setSelectedAppointmentForModal(
    timeTrackStore.entries[keyboardNavigationStore.selectedAppointmentIndex]
  );
};

export const openDetailsModal = () => {
  setSelectedTaskForModal(
    getColumnTasks()[keyboardNavigationStore.selectedTaskIndex]
  );

  openModal(ModalType.TaskDetails);
};

export const openPipelineModal = () => {
  setSelectedTaskForModal(
    getColumnTasks()[keyboardNavigationStore.selectedTaskIndex]
  );

  openModal(ModalType.Pipeline);
};
