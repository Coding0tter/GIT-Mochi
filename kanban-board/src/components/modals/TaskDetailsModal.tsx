import { createSignal, onMount, onCleanup } from "solid-js";
import { Task } from "../../services/taskService";
import BaseModal, { BaseModalProps } from "./BaseModal";

interface TaskDetailsModalProps extends BaseModalProps {
  task: Task | null;
}

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

  if (!props.task) return null;

  return (
    <BaseModal {...props}>
      <h2>Task Details</h2>
      <p>
        <strong>Title:</strong> {props.task.title}
      </p>
      <p>
        <strong>Status:</strong> {props.task.status}
      </p>
      {props.task.custom && (
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
          {props.task.comments
            ?.filter((comment) => showResolved() || !comment.resolved)
            .map((comment) => {
              return (
                <div class="comment">
                  <p>
                    <strong>{comment.author.name}:</strong> {comment.body}
                  </p>
                  {comment.images?.map((src) => (
                    <img src={src} alt="comment image" class="comment-image" />
                  ))}
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
