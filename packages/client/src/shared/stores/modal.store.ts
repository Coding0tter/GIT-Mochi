import { createBaseStore } from "@client/stores/baseStore.ts";
import type { GitlabMergeRequest } from "shared/types/gitlab/merge_request.ts";

export enum ModalType {
  DetailView = "detailView",
  AssignReview = "assignReview",
  MrPicker = "mrPicker",
  Help = "help",
}

interface ModalState {
  activeModals: ModalType[];
  closing: boolean;
  mrPickerCallback?: (mr: GitlabMergeRequest) => void;
}

const { store: modalStore, setStore: setModalStore } =
  createBaseStore<ModalState>({
    activeModals: [],
    closing: false,
  });

export { modalStore };

export const openModal = (type: ModalType) => {
  setModalStore("activeModals", [...modalStore.activeModals, type]);
};

export const setMrPickerCallback = (
  callback: (mr: GitlabMergeRequest) => void,
) => {
  setModalStore("mrPickerCallback", (mr: GitlabMergeRequest) => {
    callback(mr);
    setModalStore("mrPickerCallback", undefined);
  });
};

export const closeModal = (type: ModalType) => {
  setModalStore(
    "activeModals",
    modalStore.activeModals.filter((modal) => modal !== type),
  );
};

export const getTopModal = () => {
  return modalStore.activeModals?.at(-1);
};

export const handleCloseModal = () => {
  setModalStore("closing", true);

  setTimeout(() => {
    const activeModals = [...modalStore.activeModals];
    activeModals.pop();
    setModalStore({ activeModals: activeModals, closing: false });
  }, 300);
};
