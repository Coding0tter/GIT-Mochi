import { createSignal, onMount, onCleanup, Show, For } from "solid-js";
import BaseModal, { type BaseModalProps } from "../BaseModal/BaseModal";
import {
  modalStore,
  ModalType,
  setActiveModal,
  setSelectedDiscussionForModal,
} from "../../../stores/modalStore";
import styles from "./TaskDetailsModal.module.css";
import Badge from "../../shared/Badge/Badge";
import { parseMarkdown } from "../../../utils/parseMarkdown";
import DiscussionCard from "../../shared/DiscussionCard/DiscussionCard";
import { orderBy } from "lodash";

interface TaskDetailsModalProps extends BaseModalProps {}

const TaskDetailsModal = (props: TaskDetailsModalProps) => {
  const { selectedTask: task } = modalStore;

  const [selectedDiscussion, setSelectedDiscussion] = createSignal<number>(0);
  const [toggleSystemDiscussions, setToggleSystemDiscussions] =
    createSignal(false);
  const [toggleResolvedDiscussions, setToggleResolvedDiscussions] =
    createSignal(false);

  onMount(async () => {
    window.addEventListener("keydown", handleKeyDown);

    onCleanup(() => {
      window.removeEventListener("keydown", handleKeyDown);
    });
  });

  const handleKeyDown = (event: KeyboardEvent) => {
    if (!task?.discussions || task?.discussions.length === 0) return;

    if (event.key === "j" || event.key === "ArrowDown") {
      if (selectedDiscussion() < filteredDiscussions().length - 1) {
        setSelectedDiscussion(selectedDiscussion() + 1);
      } else {
        setSelectedDiscussion(0);
      }
    } else if (event.key === "k" || event.key === "ArrowUp") {
      if (selectedDiscussion() > 0) {
        setSelectedDiscussion(selectedDiscussion() - 1);
      } else {
        setSelectedDiscussion(filteredDiscussions().length - 1);
      }
    } else if (event.key === "t") {
      setToggleSystemDiscussions(!toggleSystemDiscussions());
    } else if (event.shiftKey && event.key === "O") {
      window.open(task.web_url, "_blank");
    } else if (event.key === "r" && event.altKey) {
      event.preventDefault();

      setSelectedDiscussionForModal(
        filteredDiscussions().at(selectedDiscussion()) || null
      );
      setActiveModal(ModalType.Reply);
    } else if (event.key === "R" && event.shiftKey) {
      console.log("Set resolved");
    } else if (event.key === "r") {
      setToggleResolvedDiscussions(!toggleResolvedDiscussions());
    }

    const discussion = document.getElementById(
      `discussion-${selectedDiscussion()}`
    );
    discussion?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const filteredDiscussions = () => {
    return orderBy(
      task?.discussions
        ?.filter(
          (discussion) =>
            toggleSystemDiscussions() || !discussion.notes?.at(0)?.system
        )
        ?.filter(
          (discussion) =>
            toggleResolvedDiscussions() || !discussion.notes?.at(0)?.resolved
        ) || [],
      (discussion) =>
        orderBy(discussion.notes, "created_at", "desc")[0].created_at,
      "desc"
    );
  };

  const getPriority = () => {
    const priorityLabel = task?.labels?.find((label) =>
      label.includes("priority")
    );
    if (priorityLabel && priorityLabel.includes("/")) {
      return priorityLabel.split("/")[1].toLowerCase();
    }
    return "default";
  };

  return (
    <BaseModal {...props} closeText="Close">
      <div class={styles.dialogContent}>
        <div>
          <div class={styles.dialogTitle}>{task?.title}</div>
        </div>
        <div class={styles.contentContainer}>
          <div class={styles.mainSection}>
            <div class={styles.card}>
              {task?.branch && (
                <div class={styles.branchInfo}>
                  <i class="fa-solid fa-code-branch"></i>
                  <span>{task?.branch}</span>
                </div>
              )}

              {task?.web_url && (
                <Badge
                  onClick={() => window.open(task.web_url, "_blank")}
                  type="default"
                >
                  <div class={styles.externalLink}>
                    <i class="fa-brands fa-gitlab"></i>
                    <span>View in GitLab</span>
                  </div>
                </Badge>
              )}
            </div>

            <Show when={task?.description}>
              <div class={styles.card}>
                <p
                  class={styles.descriptionText}
                  innerHTML={parseMarkdown(task?.description || "")}
                />
              </div>
            </Show>

            <div class={styles.card}>
              <div class={styles.badgeContainer}>
                <Badge type="default">{task?.status}</Badge>
                {task?.type && <Badge type="default">{task?.type}</Badge>}
                {task?.milestoneName && (
                  <Badge type="default">{task?.milestoneName}</Badge>
                )}
              </div>
            </div>

            {task?.labels && task.labels.length > 0 && (
              <div class={styles.card}>
                <div class={styles.labelsContainer}>
                  <Badge type={getPriority()}>{getPriority()}</Badge>
                  {task?.labels
                    .filter((task) => !task.includes("priority"))
                    .map((label) => (
                      <Badge>{label}</Badge>
                    ))}
                </div>
              </div>
            )}
          </div>

          <div class={styles.divider} />

          <h3 class={styles.discussionsHeader}>Discussions</h3>
          {task?.discussions && task.discussions.length > 0 ? (
            <div class={styles.discussionsContainer}>
              <For each={filteredDiscussions()}>
                {(discussion, index) => (
                  <DiscussionCard
                    discussion={discussion}
                    selected={() => index() === selectedDiscussion()}
                    id={`discussion-${index()}`}
                  />
                )}
              </For>
            </div>
          ) : (
            <p class={styles.descriptionText}>No discussions yet.</p>
          )}
        </div>
      </div>
    </BaseModal>
  );
};

export default TaskDetailsModal;
