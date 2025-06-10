import { createSignal, onMount, type JSXElement } from "solid-js";
import BaseModal, { type BaseModalProps } from "../BaseModal/BaseModal";
import { closeModal, modalStore, ModalType } from "@client/stores/modalStore";
import { createMergeRequestAndBranchAsync } from "@client/services/gitlabService";
import { addNotification } from "@client/services/notificationService";
import styles from "./BranchNameModal.module.css";

interface BranchNameModalProps extends BaseModalProps {}

const BranchNameModal = (props: BranchNameModalProps): JSXElement => {
  const [branchName, setBranchName] = createSignal<string>("");
  let inputRef: HTMLInputElement | null = null;

  onMount(() => {
    setTimeout(() => inputRef?.focus(), 0);
  });

  const validBranchName = (name: string) => {
    return /^[A-Za-z0-9._-]+$/.test(name) && name.trim().length > 0;
  };

  const handleSubmit = async () => {
    const issueId = modalStore.selectedTask?.gitlabIid?.toString() || "";

    if (!issueId) {
      addNotification({
        title: "Error",
        description: "No issue ID found. Please select a valid task",
        type: "error",
      });
      return;
    }

    if (!validBranchName(branchName())) {
      addNotification({
        title: "Error",
        description:
          "Invalid branch name. Only alphanumeric characters, dots, underscores, and hyphens are allowed.",
        type: "error",
      });

      return;
    }

    try {
      const { mergeRequest } = await createMergeRequestAndBranchAsync(
        issueId,
        branchName(),
      );
      addNotification({
        title: "Branch and Merge request created",
        description: `Created merge request ${mergeRequest.title}`,
        type: "success",
      });
      closeModal(ModalType.BranchName);
    } catch (error) {
      addNotification({
        title: "Error",
        description: "Failed to create merge request",
        type: "error",
      });
    }
  };

  return (
    <BaseModal
      {...props}
      submitText="Create"
      closeText="Cancel"
      onSubmit={handleSubmit}
      onClose={() => closeModal(ModalType.BranchName)}
    >
      <h2>Enter branch name</h2>
      <div class={styles.form}>
        <label for="branch-name">Branch name</label>
        <input
          id="branch-name"
          type="text"
          ref={(el) => (inputRef = el)}
          value={branchName()}
          onInput={(e) => setBranchName(e.currentTarget.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSubmit();
            else if (e.key === "Escape") closeModal(ModalType.BranchName);
          }}
          placeholder="Branch name"
        />
      </div>
    </BaseModal>
  );
};

export default BranchNameModal;
