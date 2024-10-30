import { JSX, ParentComponent } from "solid-js";
import { modalStore } from "../../../stores/modalStore";
import styles from "./BaseModal.module.css";
import Button from "../../Button/Button";

export interface BaseModalProps {
  onClose?: () => void;
  closeText?: string;
  onSubmit?: () => void;
  submitText?: string | (() => string);
}

const BaseModal: ParentComponent<BaseModalProps> = (props): JSX.Element => {
  return (
    <div
      class={
        modalStore.closing ? `${styles.modal} ${styles.hidden}` : styles.modal
      }
    >
      <div class={styles.modalWrapper}>
        <div class={styles.modalContent}>{props.children}</div>
        <div class={styles.modalButtons}>
          {props.submitText !== undefined && (
            <Button type="primary" onClick={props.onSubmit!}>
              {props.submitText instanceof Function
                ? props.submitText()
                : props.submitText}
            </Button>
          )}
          {props.closeText !== undefined && (
            <Button type="secondary" onClick={props.onClose!}>
              {props.closeText}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BaseModal;