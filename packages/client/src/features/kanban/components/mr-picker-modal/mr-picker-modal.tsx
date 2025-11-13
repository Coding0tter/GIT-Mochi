import type { BaseModalProps } from "@client/components/modals/BaseModal/BaseModal.tsx";
import BaseModal from "@client/components/modals/BaseModal/BaseModal.tsx";
import { currentTask } from "@client/shared/stores/keyboard-navigation.store.ts";
import { createSignal, For, onMount, onCleanup } from "solid-js";
import styles from "./mr-picker-modal.module.css";
import type { GitlabMergeRequest } from "shared/types/gitlab/merge_request.ts";

interface MergeRequestPickerModalProps extends BaseModalProps {
  onSelect?: (mr: GitlabMergeRequest) => void;
}

const MergeRequestPickerModal = (props: MergeRequestPickerModalProps) => {
  const task = currentTask();
  const mergeRequests = task?.merge_requests || [];
  const [selectedIndex, setSelectedIndex] = createSignal(0);

  const handleKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case "ArrowDown":
      case "j":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < mergeRequests.length - 1 ? prev + 1 : prev,
        );
        break;
      case "ArrowUp":
      case "k":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        break;
      case "Enter":
        e.preventDefault();
        handleSelect(mergeRequests[selectedIndex()]);
        break;
      case "Escape":
        e.preventDefault();
        props.onClose?.();
        break;
    }
  };

  onMount(() => {
    window.addEventListener("keydown", handleKeyDown);
  });

  onCleanup(() => {
    window.removeEventListener("keydown", handleKeyDown);
  });

  const handleSelect = (mr: GitlabMergeRequest) => {
    props.onSelect?.(mr);
    props.onClose?.();
  };

  return (
    <BaseModal {...props} closeText="Cancel">
      <div class={styles.container}>
        <div class={styles.header}>
          <h2>
            <i class="fa-solid fa-code-pull-request"></i> Select Merge Request
          </h2>
          <div class={styles.taskInfo}>
            <span class={styles.taskTitle}>{task?.title}</span>
          </div>
        </div>

        <div class={styles.mrList}>
          <For each={mergeRequests}>
            {(mr, index) => (
              <div
                class={styles.mrCard}
                classList={{ [styles.selected]: selectedIndex() === index() }}
                onClick={() => handleSelect(mr)}
                onMouseEnter={() => setSelectedIndex(index())}
              >
                <div class={styles.mrHeader}>
                  <div class={styles.mrInfo}>
                    <div class={styles.mrTitle}>{mr.title}</div>
                    <div class={styles.branchName}>
                      <i class="fa-solid fa-code-branch"></i>
                      {mr.source_branch}
                    </div>
                  </div>
                  <div
                    class={`${styles.pipelineStatus} ${styles[mr.pipeline?.status || "none"]}`}
                  >
                    <i
                      class={`fa-solid ${
                        mr.pipeline?.status === "success"
                          ? "fa-circle-check"
                          : mr.pipeline?.status === "failed"
                            ? "fa-circle-xmark"
                            : mr.pipeline?.status === "running"
                              ? "fa-spinner fa-spin"
                              : "fa-circle-question"
                      }`}
                    ></i>
                    {mr.pipeline?.status || "No Pipeline"}
                  </div>
                </div>

                <div class={styles.mrMeta}>
                  <span class={styles.metaItem}>
                    <i class="fa-solid fa-hashtag"></i>
                    {mr.iid}
                  </span>
                  <span class={styles.metaItem}>
                    <i class="fa-solid fa-arrow-right"></i>
                    {mr.target_branch}
                  </span>
                </div>
              </div>
            )}
          </For>
        </div>
      </div>
    </BaseModal>
  );
};

export default MergeRequestPickerModal;
