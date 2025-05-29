import Loading from "@client/components/shared/Loading/Loading";
import {
  discussionStore,
  fetchDiscussions,
} from "@client/stores/discussion.store";
import {
  getNavIndex,
  NavigationKeys,
  setNavIndex,
} from "@client/stores/keyboardNavigationStore";
import {
  createEffect,
  For,
  onCleanup,
  onMount,
  Show,
  Suspense,
} from "solid-js";
import { modalStore } from "../../../stores/modalStore";
import { parseMarkdown } from "../../../utils/parseMarkdown";
import Badge from "../../shared/Badge/Badge";
import DiscussionCard from "../../shared/DiscussionCard/DiscussionCard";
import BaseModal, { type BaseModalProps } from "../BaseModal/BaseModal";
import { TaskDetailsModalService } from "./task-details-modal.store";
import styles from "./TaskDetailsModal.module.css";
import { scrollIntoView } from "@client/utils/scrollIntoView";
import { LoadingTarget, uiStore } from "@client/stores/uiStore";

interface TaskDetailsModalProps extends BaseModalProps {}

const TaskDetailsModal = (props: TaskDetailsModalProps) => {
  const { selectedTask: task } = modalStore;

  onMount(async () => {
    if (task) await fetchDiscussions(task.gitlabIid!, task.type!);
  });

  onCleanup(() => {
    setNavIndex(NavigationKeys.Discussion, 0);
  });

  createEffect(() => {
    const discussion = document.getElementById(
      `discussion-${getNavIndex(NavigationKeys.Discussion)}`,
    );

    scrollIntoView(discussion);
  });

  const getPriority = () => {
    const priorityLabel = task?.labels?.find((label) =>
      label.includes("priority"),
    );
    if (priorityLabel && priorityLabel.includes("/")) {
      return priorityLabel.split("/")[1].toLowerCase();
    }
    return null;
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
              <div class={styles.topRow}>
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
                <p
                  class={styles.descriptionText}
                  innerHTML={parseMarkdown(task?.description || "")}
                />
              </Show>
            </div>

            <div class={styles.card}>
              <div class={styles.badgeContainer}>
                {task?.type && <Badge type="default">{task?.type}</Badge>}
                {task?.milestoneName && (
                  <Badge type="default">{task?.milestoneName}</Badge>
                )}
              </div>
            </div>

            {task?.labels && task.labels.length > 0 && (
              <div class={styles.card}>
                <div class={styles.labelsContainer}>
                  {getPriority() && (
                    <Badge type={getPriority()!}>{getPriority()}</Badge>
                  )}
                  {task?.labels
                    .filter((task) => !task.includes("priority"))
                    .map((label) => <Badge>{label}</Badge>)}
                </div>
              </div>
            )}
          </div>

          <div class={styles.divider} />

          <h3 class={styles.discussionsHeader}>Discussions</h3>
          <Show
            when={uiStore.loadingTarget !== LoadingTarget.LoadDiscussions}
            fallback={<Loading />}
          >
            {discussionStore.discussions &&
            discussionStore.discussions.length > 0 ? (
              <div class={styles.discussionsContainer}>
                <For each={TaskDetailsModalService.filteredDiscussions()}>
                  {(discussion, index) => (
                    <DiscussionCard
                      focusThread={TaskDetailsModalService.toggleThreadFocus}
                      discussion={discussion}
                      selected={() =>
                        index() === getNavIndex(NavigationKeys.Discussion)
                      }
                      id={`discussion-${index()}`}
                    />
                  )}
                </For>
              </div>
            ) : (
              <p class={styles.descriptionText}>No discussions yet.</p>
            )}
          </Show>
        </div>
      </div>
    </BaseModal>
  );
};

export default TaskDetailsModal;
