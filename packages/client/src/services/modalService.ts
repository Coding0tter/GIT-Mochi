import type { ITask } from "shared/types/task";
import { handleCloseModal } from "../stores/modalStore";

export const openDeleteModal = () => {
  console.log("open detail not implemented");
};

export const openCreateModal = () => {
  console.log("open create not implemented");
};

export const openEditTaskModal = () => {
  console.log("open edit not implemented");
};

export const openEditAppointmentModal = () => {
  console.log("open edit appointment not implemented");
};

export const openPipelineModal = () => {
  console.log("open pipeline not implemented");
};

export const openBranchNameModal = (task: ITask) => {
  console.log("open branch name not implemented");
};

export const closeTopModal = () => {
  handleCloseModal();
};
