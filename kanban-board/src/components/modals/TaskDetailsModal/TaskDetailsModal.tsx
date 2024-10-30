import { createSignal, onMount, onCleanup } from "solid-js";
import BaseModal, { BaseModalProps } from "../BaseModal/BaseModal";
import { modalStore } from "../../../stores/modalStore";
import DOMPurify from "dompurify";
import styles from "./TaskDetailsModal.module.css";
import Badge from "../../Badge/Badge";

interface TaskDetailsModalProps extends BaseModalProps {}

const TaskDetailsModal = (props: TaskDetailsModalProps) => {
  const [showResolved, setShowResolved] = createSignal(false);

  onMount(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === " ") {
        event.preventDefault();
        toggleResolved();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    onCleanup(() => {
      window.removeEventListener("keydown", handleKeyDown);
    });
  });

  const toggleResolved = () => {
    setShowResolved(!showResolved());
  };

  const getPriorityLabel = () => {
    return (
      modalStore.selectedTask?.labels
        ?.find((item: string) => item.toLowerCase().includes("priority"))
        ?.split("priority/")
        ?.at(1)
        ?.toLowerCase() ?? ""
    );
  };

  const formatCommentBody = (body: string) => {
    const sanitizedBody = DOMPurify.sanitize(body);
    return sanitizedBody.replace(/\n/g, "<br />");
  };

  return (
    <BaseModal {...props} closeText="Close">
      <div class={styles.taskDetailsContainer}>
        <div class={styles.taskInfo}>
          <h2>Task Details</h2>
          <p>
            <strong>Title:</strong> {modalStore.selectedTask?.title}
          </p>
          <Badge>
            <strong>Status:</strong> {modalStore.selectedTask?.status}
          </Badge>
          {modalStore.selectedTask?.branch && (
            <Badge>
              <strong>Branch:</strong> {modalStore.selectedTask?.branch}
            </Badge>
          )}
          {modalStore.selectedTask?.custom && (
            <Badge>
              <strong>Custom Task:</strong> Yes
            </Badge>
          )}
          {getPriorityLabel() && (
            <Badge type={getPriorityLabel()}>
              <strong>Priority: </strong>
              {getPriorityLabel()}
            </Badge>
          )}
        </div>

        <div class={styles.taskComments}>
          <div class={styles.commentHeader}>
            <h3>Comments</h3>
          </div>
          <div class={styles.commentWrapper}>
            {modalStore.selectedTask?.comments
              ?.filter((comment) => showResolved() || !comment.resolved)
              .map((comment) => (
                <div class={styles.comment}>
                  <div class={styles.authorInfo}>
                    <span class={styles.authorName}>{comment.author.name}</span>
                  </div>
                  <div
                    class={styles.commentText}
                    innerHTML={formatCommentBody(comment.body)}
                  />
                  {comment.images?.map((src) =>
                    src.includes(".webm") ? (
                      <video src={src} class={styles.commentImage} controls />
                    ) : (
                      <img
                        src={src}
                        alt="comment image"
                        class={styles.commentImage}
                      />
                    )
                  )}
                </div>
              ))}
          </div>
        </div>
      </div>
    </BaseModal>
  );
};

export default TaskDetailsModal;
