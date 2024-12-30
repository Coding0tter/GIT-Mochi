import {
  createEffect,
  createSignal,
  onMount,
  type JSXElement,
  type ParentComponent,
} from "solid-js";
import { modalStore } from "../../../stores/modalStore";
import styles from "./BaseModal.module.css";
import Button from "../../shared/Button/Button";

export interface BaseModalProps {
  onClose?: () => void;
  closeText?: string;
  onSubmit?: () => void;
  submitText?: string | (() => string);
}

const BaseModal: ParentComponent<BaseModalProps> = (props): JSXElement => {
  const [index, setIndex] = createSignal<number>(0);
  const [fadeOut, setFadeOut] = createSignal<boolean>(false);

  onMount(() => {
    setIndex(modalStore.activeModals.length - 1);
  });

  createEffect(() => {
    if (modalStore.closing && index() === modalStore.activeModals.length - 1) {
      setFadeOut(true);
    }
  }, [modalStore.closing]);

  return (
    <div class={fadeOut() ? `${styles.modal} ${styles.hidden}` : styles.modal}>
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
