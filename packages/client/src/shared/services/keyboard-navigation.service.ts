import {
  markTaskAsRead,
  openDetailModal,
} from "@client/features/kanban/stores/kanban.store.ts";
import { addNotification } from "@client/services/notificationService.ts";
import { fetchPipelineDetails } from "@client/shared/services/gitlab.service.ts";
import { currentTask } from "@client/shared/stores/keyboard-navigation.store.ts";
import {
  ModalType,
  openModal,
  setMrPickerCallback,
} from "@client/shared/stores/modal.store.ts";

export const handleOpenDetailModal = () => {
  const task = currentTask();
  if (task) {
    openDetailModal(task.id);
    markTaskAsRead(task.id);
  }
};

export const openIssueExternally = () => {
  const task = currentTask();

  if (task) window.open(task.web_url, "_blank");
};

export const openMergeRequestExternally = () => {
  const task = currentTask();

  if (task) {
    const mrs = task.merge_requests || [];

    if (mrs.length === 1) {
      window.open(mrs[0].web_url, "_blank");
    } else if (mrs.length > 1) {
      setMrPickerCallback((mr) => {
        window.open(mr.web_url, "_blank");
      });
      openModal(ModalType.MrPicker);
    }
  }
};

export const openPipelineModal = () => {
  const task = currentTask();

  try {
    if (task) {
      const mrs = task.merge_requests || [];

      if (mrs.length === 1) {
        fetchPipelineDetails(mrs[0].iid);
      } else if (mrs.length > 1) {
        setMrPickerCallback((mr) => {
          fetchPipelineDetails(mr.iid);
        });
        openModal(ModalType.MrPicker);
      }
    }
  } catch (error) {
    addNotification({
      type: "error",
      title: "Error",
      description: "Failed to fetch pipeline details.",
    });
  }
};
