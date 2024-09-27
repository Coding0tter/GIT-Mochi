import { JSX, onMount } from "solid-js";
import BaseModal, { BaseModalProps } from "./BaseModal";
import { Task } from "../../services/taskService";
import { STATES } from "../../constants";

interface EditTaskModalProps extends BaseModalProps {
  task: Task | null;
}

const EditOrCreateTaskModal = (props: EditTaskModalProps): JSX.Element => {
  let inputRef: HTMLInputElement | null = null;

  onMount(() => {
    if (inputRef) {
      setTimeout(() => inputRef?.focus(), 0);
    }
  });

  return (
    <BaseModal {...props}>
      <h2>{props.task?._id !== undefined ? "Edit" : "Create"} Custom Task</h2>
      <input
        type="text"
        value={props.task?.title || ""}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            props.onSubmit!();
          } else if (e.key === "Escape") {
            props.onClose();
          }
        }}
        ref={(el) => (inputRef = el)}
        onInput={(e) => (props.task!.title = e.currentTarget.value)}
        placeholder="Task Title"
      />
      <select
        value={props.task?.status || "opened"}
        onChange={(e) => (props.task!.status = e.currentTarget.value)}
      >
        {STATES.map((item) => (
          <option value={item.id}>{item.display_name}</option>
        ))}
      </select>
      <textarea
        onInput={(e) => (props.task!.description = e.target.value)}
        value={props.task?.description || ""}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            props.onSubmit!();
          } else if (e.key === "Escape") {
            props.onClose();
          }
        }}
      />
      <button onClick={props.onSubmit}>
        {props.task?._id !== undefined ? "Edit" : "Add"} Task
      </button>
    </BaseModal>
  );
};

export default EditOrCreateTaskModal;
