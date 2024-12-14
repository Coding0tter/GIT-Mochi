import { createSignal, onCleanup, onMount } from "solid-js";
import BaseModal, { type BaseModalProps } from "../BaseModal/BaseModal";
import styles from "./ReplyModal.module.css";
import {
  modalStore,
  ModalType,
  setActiveModal,
} from "../../../stores/modalStore";
import DiscussionCard from "@client/components/shared/DiscussionCard/DiscussionCard";
import { replyToDiscussionAsync } from "@client/services/gitlabService";

interface ReplyModalProps extends BaseModalProps {}

const ReplyModal = (props: ReplyModalProps) => {
  const { selectedDiscussion: discussion } = modalStore;
  const [reply, setReply] = createSignal<string>("");
  let inputRef: HTMLTextAreaElement | null = null;

  onMount(() => {
    if (inputRef) {
      setTimeout(() => inputRef?.focus(), 0);
    }

    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === "Enter" && event.ctrlKey) {
        replyToDiscussionAsync(discussion!, reply());
        setActiveModal(ModalType.TaskDetails);
      }
    };

    window.addEventListener("keydown", handleKeydown);

    onCleanup(() => {
      window.removeEventListener("keydown", handleKeydown);
    });
  });

  const handleInput = (e: InputEvent) => {
    const target = e.currentTarget as HTMLTextAreaElement;
    setReply(target.value);
    adjustHeight(target);
  };

  const adjustHeight = (textarea: HTMLTextAreaElement) => {
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  return (
    <BaseModal {...props}>
      <div class={styles.container}>
        <h1 class={styles.title}>Reply</h1>
        <DiscussionCard
          discussion={discussion!}
          selected={() => false}
          id="reply"
        />
        <div class={styles.card}>
          <textarea
            class={styles.replyArea}
            ref={(ref) => (inputRef = ref)}
            onInput={handleInput}
            placeholder="Write a reply..."
            rows={1}
          ></textarea>
        </div>
      </div>
    </BaseModal>
  );
};

export default ReplyModal;