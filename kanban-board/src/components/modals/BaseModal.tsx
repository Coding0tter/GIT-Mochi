import { JSX, ParentComponent } from "solid-js";
import { modalStore } from "../../stores/modalStore";

export interface BaseModalProps {
  onClose: () => void;
  onSubmit?: () => void;
}

const BaseModal: ParentComponent<BaseModalProps> = (props): JSX.Element => {
  return (
    <div class={modalStore.closing ? "modal hidden" : "modal"}>
      <div class="modal-content">{props.children}</div>
    </div>
  );
};

export default BaseModal;
