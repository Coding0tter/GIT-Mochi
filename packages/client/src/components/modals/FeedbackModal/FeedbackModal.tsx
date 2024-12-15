import BaseModal from "@client/components/modals/BaseModal/BaseModal";
import { createSignal, onMount } from "solid-js";
import styles from "./FeedbackModal.module.css";

interface FeedbackModalProps {
  onClose: () => void;
}

const FeedbackModal = (props: FeedbackModalProps) => {
  const [message, setMessage] = createSignal("");
  let textAreaRef: HTMLTextAreaElement;

  onMount(() => {
    if (textAreaRef) textAreaRef.focus();
  });

  const handleSubmit = () => {
    const mailto = document.getElementById("send") as HTMLAnchorElement;
    if (mailto) {
      mailto.href = `mailto:maximilian.kriegl@gmx.at?subject=Feedback-Mochi&body=${encodeURIComponent(
        message()
      )}`;
      mailto.click();
    }
    props.onClose();
  };

  return (
    <BaseModal
      onClose={props.onClose}
      onSubmit={handleSubmit}
      closeText="Cancel"
      submitText="Submit Feedback"
    >
      <header class={styles.header}>Submit Feedback</header>
      <p class={styles.description}>
        We value your feedback. Please let us know your thoughts below.
      </p>
      <div class={styles.formGroup}>
        <label class={styles.label} for="message">
          Message
        </label>
        <textarea
          ref={(ref) => (textAreaRef = ref)}
          id="message"
          class={styles.textarea}
          placeholder="Your feedback"
          value={message()}
          onInput={(e) => setMessage(e.currentTarget.value)}
        />
      </div>
      {/* Hidden anchor element */}
      <a id="send" style="display: none;">
        Send Feedback
      </a>
    </BaseModal>
  );
};

export default FeedbackModal;
