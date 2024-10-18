import { createSignal, onMount, onCleanup } from "solid-js";
import BaseModal, { BaseModalProps } from "./BaseModal";
import { modalStore } from "../../stores/modalStore";
import DOMPurify from "dompurify";

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
        ?.toLowerCase() ?? false
    );
  };

  const formatCommentBody = (body: string) => {
    const sanitizedBody = DOMPurify.sanitize(body);
    return sanitizedBody.replace(/\n/g, "<br />");
  };

  return (
    <BaseModal {...props}>
      <div class="task-details-container">
        <div class="task-info">
          <h2>Task Details</h2>
          <p>
            <strong>Title:</strong> {modalStore.selectedTask?.title}
          </p>
          <p>
            <strong>Status:</strong> {modalStore.selectedTask?.status}
          </p>
          {modalStore.selectedTask?.branch && (
            <p>
              <strong>Branch:</strong> {modalStore.selectedTask?.branch}
            </p>
          )}
          {modalStore.selectedTask?.custom && (
            <p>
              <strong>Custom Task:</strong> Yes
            </p>
          )}
          {getPriorityLabel() && (
            <p>
              <strong>Priority:</strong>
              {getPriorityLabel()}
            </p>
          )}
        </div>

        <div class="task-comments">
          <div class="modal-headline">
            <h3>Comments</h3>
            <button class="show-resolved-btn" onClick={toggleResolved}>
              {showResolved() ? "Hide Resolved" : "Show Resolved"}
            </button>
          </div>
          <div class="comment-wrapper">
            {modalStore.selectedTask?.comments
              ?.filter((comment) => showResolved() || !comment.resolved)
              .map((comment) => (
                <div class="comment">
                  <div>
                    <strong>{comment.author.name}:</strong>
                    <div innerHTML={formatCommentBody(comment.body)} />
                  </div>
                  {comment.images?.map((src) =>
                    src.includes(".webm") ? (
                      <video src={src} class="comment-image" controls />
                    ) : (
                      <img
                        src={src}
                        alt="comment image"
                        class="comment-image"
                      />
                    )
                  )}
                </div>
              ))}
          </div>
        </div>
      </div>

      <button class="close-btn" onClick={props.onClose}>
        Close
      </button>
    </BaseModal>
  );
};

export default TaskDetailsModal;
