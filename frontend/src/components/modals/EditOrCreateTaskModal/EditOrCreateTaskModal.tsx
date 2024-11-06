import { JSX, onMount } from "solid-js";
import { STATES } from "../../../constants";
import { modalStore, setSelectedTaskValue } from "../../../stores/modalStore";
import BaseModal, { BaseModalProps } from "../BaseModal/BaseModal";
import styles from "./EditOrCreateTaskModal.module.css";

interface EditTaskModalProps extends BaseModalProps {}

const EditOrCreateTaskModal = (props: EditTaskModalProps): JSX.Element => {
  let inputRef: HTMLInputElement | null = null;

  onMount(() => {
    if (inputRef) {
      setTimeout(() => inputRef?.focus(), 0);
    }
  });

  return (
    <BaseModal {...props} submitText={"Submit"}>
      <h2>
        {modalStore.selectedTask?._id !== undefined ? "Edit" : "Create"} Custom
        Task
      </h2>
      <div class={styles.form}>
        <input
          type="text"
          value={modalStore.selectedTask?.title || ""}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              props.onSubmit!();
            } else if (e.key === "Escape") {
              props.onClose!();
            }
          }}
          ref={(el) => (inputRef = el)}
          onInput={(e) => setSelectedTaskValue("title", e.currentTarget.value)}
          placeholder="Task Title"
        />
        <select
          value={modalStore.selectedTask?.status || "opened"}
          onChange={(e) =>
            setSelectedTaskValue("status", e.currentTarget.value)
          }
        >
          {STATES.map((item) => (
            <option value={item.id}>{item.display_name}</option>
          ))}
        </select>
        <textarea
          onInput={(e) => setSelectedTaskValue("description", e.target.value)}
          value={modalStore.selectedTask?.description || ""}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              props.onSubmit!();
            } else if (e.key === "Escape") {
              props.onClose!();
            }
          }}
        />
      </div>
    </BaseModal>
  );
};

export default EditOrCreateTaskModal;
