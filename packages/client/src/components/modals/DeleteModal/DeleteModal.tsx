import { type JSXElement, onCleanup, onMount } from "solid-js";
import BaseModal, { type BaseModalProps } from "../BaseModal/BaseModal";
import { modalStore } from "../../../stores/modalStore";

interface DeleteModalProps extends BaseModalProps {}

const DeleteModal = (props: DeleteModalProps): JSXElement => {
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Y" || event.key === "y") {
      props.onSubmit!();
    } else if (event.key === "N" || event.key === "n") {
      props.onClose!();
    }
  };

  onMount(() => {
    window.addEventListener("keydown", handleKeyDown);

    onCleanup(() => {
      window.removeEventListener("keydown", handleKeyDown);
    });
  });

  return (
    <BaseModal {...props} closeText="(N)o, keep it" submitText="(Y)es, delete">
      <h2>Delete Task</h2>
      <p>Are you sure you want to delete selected tasks?</p>
      <p>{modalStore.selectedTask?.title}</p>
    </BaseModal>
  );
};

export default DeleteModal;
