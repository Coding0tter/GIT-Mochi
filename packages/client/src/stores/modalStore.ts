import type { TimeTrackEntry } from "@client/stores/timeTrackStore";
import dayjs from "dayjs";
import type { IComment, ITask } from "shared/types/task";
import { createStore, reconcile } from "solid-js/store";
import type { IDiscussion } from "shared/types/task";

export enum ModalType {
  CreateTask = "create-task",
  DeleteTask = "delete-task",
  TaskDetails = "task-details",
  Help = "help",
  EditAppointment = "edit-appointment",
  None = "",
  Pipeline = "pipeline",
  Reply = "reply",
  BranchName = "branch-name",
}

export const [modalStore, setModalStore] = createStore({
  activeModals: [] as ModalType[],
  activeModal: ModalType.None,
  selectedTask: null as ITask | null,
  selectedAppointment: null as TimeTrackEntry | null,
  selectedComment: null as IComment | null,
  selectedDiscussion: null as IDiscussion | null,
  closing: false,
});

export const openModal = (type: ModalType) => {
  setModalStore("activeModals", [...modalStore.activeModals, type]);
};

export const closeModal = (type: ModalType) => {
  setModalStore(
    "activeModals",
    modalStore.activeModals.filter((modal) => modal !== type),
  );
};

export const setActiveModal = (type: ModalType) => {
  setModalStore("activeModal", type);
};

export const setSelectedTaskForModal = (task: Partial<ITask> | null) => {
  setModalStore("selectedTask", reconcile(task as ITask));
};

export const setSelectedAppointmentForModal = (
  task: Partial<TimeTrackEntry> | null,
) => {
  setModalStore("selectedAppointment", reconcile(task as TimeTrackEntry));
};

export const setSelectedCommentForModal = (comment: IComment | null) => {
  setModalStore("selectedComment", reconcile(comment));
};

export const setSelectedDiscussionForModal = (
  discussion: IDiscussion | null,
) => {
  setModalStore("selectedDiscussion", reconcile(discussion));
};

export const setSelectedTaskValue = (key: string, value: string) => {
  setModalStore("selectedTask", {
    ...modalStore.selectedTask!,
    [key]: value,
  });
};

export const setSelectedAppointmentValue = (
  key: keyof TimeTrackEntry,
  value: string,
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
      .toISOString(),
  });
};

export const handleCloseModal = () => {
  // meh
  setModalStore("closing", true);
  setModalStore("closing", false);

  setTimeout(() => {
    const activeModals = [...modalStore.activeModals];
    activeModals.pop();
    setModalStore("activeModals", activeModals);
    setModalStore("selectedTask", null);
  }, 300);
};
