import { createSignal, onMount, onCleanup } from "solid-js";
import BaseModal, { BaseModalProps } from "./BaseModal";
import { modalStore } from "../../stores/modalStore";

interface TaskDetailsModalProps extends BaseModalProps {}

const TaskDetailsModal = (props: TaskDetailsModalProps) => {
  const [showResolved, setShowResolved] = createSignal(false);

  onMount(async () => {
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

  return (
    <BaseModal {...props}>
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

      {/* Comments Section */}

      <div>
        <div class="modal-headline">
          <h3>Comments</h3>
          <button class="show-resolved-btn" onClick={toggleResolved}>
            {showResolved() ? "hide resolved" : "show resolved"}
          </button>
        </div>
        <div class="comment-wrapper">
          {modalStore.selectedTask?.comments
            ?.filter((comment) => showResolved() || !comment.resolved)
            .map((comment) => {
              return (
                <div class="comment">
                  <p>
                    <strong>{comment.author.name}:</strong> {comment.body}
                  </p>
                  {comment.images?.map((src) => {
                    if (src.includes(".webm")) {
                      return <video src={src} class="comment-image" controls />;
                    }
                    return (
                      <img
                        src={src}
                        alt="comment image"
                        class="comment-image"
                      />
                    );
                  })}
                </div>
              );
            })}
        </div>
      </div>

      <button class="close-btn" onClick={props.onClose}>
        Close
      </button>
    </BaseModal>
  );
};

export default TaskDetailsModal;
