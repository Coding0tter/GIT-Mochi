import { JSX, ParentComponent } from "solid-js";

export interface BaseModalProps {
  onClose: () => void;
  onSubmit?: () => void;
  closing: boolean;
}

const BaseModal: ParentComponent<BaseModalProps> = (props): JSX.Element => {
  return (
    <div class={props.closing ? "modal hidden" : "modal"}>
      <div class="modal-content">{props.children}</div>
    </div>
  );
};

export default BaseModal;
