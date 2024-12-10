import { createStore, reconcile } from "solid-js/store";
import { Task } from "./taskStore";
import { TimeTrackEntry } from "./timeTrackStore";
import dayjs from "dayjs";

export enum ModalType {
  CreateTask,
  DeleteTask,
  TaskDetails,
  Help,
  EditAppointment,
  None,
  Pipeline,
}

export const [modalStore, setModalStore] = createStore({
  activeModal: ModalType.None,
  selectedTask: null as Task | null,
  selectedAppointment: null as TimeTrackEntry | null,
  closing: false,
});

export const setActiveModal = (type: ModalType) => {
  setModalStore("activeModal", type);
};

export const setSelectedTaskForModal = (task: Partial<Task> | null) => {
  setModalStore("selectedTask", reconcile(task as Task));
};

export const setSelectedAppointmentForModal = (
  task: Partial<TimeTrackEntry> | null
) => {
  setModalStore("selectedAppointment", reconcile(task as TimeTrackEntry));
};

export const setSelectedTaskValue = (key: string, value: string) => {
  setModalStore("selectedTask", {
    ...modalStore.selectedTask!,
    [key]: value,
  });
};

export const setSelectedAppointmentValue = (
  key: keyof TimeTrackEntry,
  value: string
) => {
  if (!modalStore.selectedAppointment) {
    console.error("No selected appointment in modalStore.");
    return;
  }

  if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(value)) {
    console.error("Invalid time format. Expected HH:mm.");
    return;
  }

  const [hour, minute] = value.split(":").map(Number);

  setModalStore("selectedAppointment", {
    ...modalStore.selectedAppointment,
    [key]: dayjs(modalStore.selectedAppointment[key])
      .set("hour", hour)
      .set("minute", minute)
      .toISOString(), // Converts the date to a consistent string format
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
