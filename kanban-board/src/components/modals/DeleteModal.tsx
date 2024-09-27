import { JSX, createEffect, onCleanup, onMount } from "solid-js";
import BaseModal, { BaseModalProps } from "./BaseModal";
import { Task } from "../../services/taskService";

interface DeleteModalProps extends BaseModalProps {
  task: Task | null;
}

const DeleteModal = (props: DeleteModalProps): JSX.Element => {
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Y" || event.key === "y") {
      props.onSubmit!();
    } else if (event.key === "N" || event.key === "n") {
      props.onClose();
    }
  };

  onMount(() => {
    window.addEventListener("keydown", handleKeyDown);

    onCleanup(() => {
      window.removeEventListener("keydown", handleKeyDown);
    });
  });

  return (
    <BaseModal {...props}>
      <h2>Delete Task</h2>
      <p>Are you sure you want to delete this task?</p>
      <p>{props.task?.title}</p>
      <button onClick={props.onSubmit}>(Y)es, Delete</button>
      <button onClick={props.onClose}>(N)o, keep it</button>
    </BaseModal>
  );
};

export default DeleteModal;
