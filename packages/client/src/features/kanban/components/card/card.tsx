import xMasHat from "@client/assets/xmas.png";
import {
  markTaskAsRead,
  openDetailModal,
} from "@client/features/kanban/stores/kanban.store.ts";
import { startReview } from "@client/features/kanban/stores/review.store.ts";
import { addNotification } from "@client/services/notificationService.ts";
import { createMergeRequest } from "@client/shared/services/gitlab.service.ts";
import { ModalType, openModal } from "@client/shared/stores/modal.store.ts";
import { userStore } from "@client/shared/stores/user.store.ts";
import { createSortable } from "@thisbeyond/solid-dnd";
import dayjs from "dayjs";
import type { ITaskV2 } from "shared/types/task.v2.ts";
import { random } from "shared/utils/random";
import { For, Show, createSignal, onCleanup } from "solid-js";
import styles from "./card.module.css";

type CardProps = {
  id: string;
  task: ITaskV2;
  active: boolean;
};

const TaskCard = (props: CardProps) => {
  const task = props.task;
  const sortable = createSortable(props.id);
  const [menuOpen, setMenuOpen] = createSignal(false);
  const [showAllLabels, setShowAllLabels] = createSignal(false);
  const MAX_VISIBLE_LABELS = 3;
  let menuRef: HTMLDivElement | undefined;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <i class="fa-regular fa-thumbs-up"></i>;
      case "failed":
        return <i class="fa-regular fa-thumbs-down"></i>;
      case "running":
      case "pending":
        return <i class="fa-solid fa-person-running"></i>;
      case "canceled":
        return <i class="fa-solid fa-stop"></i>;
      case "skipped":
        return <i class="fa-solid fa-forward"></i>;
      default:
        break;
    }
  };

  const getLabelColor = (label: string) => {
    const colors = [
      "blue",
      "green",
      "yellow",
      "red",
      "mauve",
      "teal",
      "peach",
      "pink",
    ];
    const value = random(label);
    const index = Math.floor(value * colors.length);
    return colors[index];
  };

  const handleClickOutside = (e: MouseEvent) => {
    if (menuRef && !menuRef.contains(e.target as Node)) {
      setMenuOpen(false);
    }
  };

  const handleMenuToggle = (e: MouseEvent) => {
    e.stopPropagation();
    const newState = !menuOpen();
    setMenuOpen(newState);

    if (newState) {
      document.addEventListener("click", handleClickOutside);
    } else {
      document.removeEventListener("click", handleClickOutside);
    }
  };

  onCleanup(() => {
    document.removeEventListener("click", handleClickOutside);
  });

  const sortedLabels = () => {
    // order labels. priority::<> first then tpo::<> then the rest
    const priorityLabels =
      task.labels?.filter(
        (label) =>
          label.startsWith("priority::") || label.startsWith("progress::"),
      ) ?? [];
    const tpoLabels =
      task.labels?.filter((label) => label.startsWith("tpo::")) ?? [];
    const otherLabels =
      task.labels?.filter(
        (label) =>
          !label.startsWith("priority::") && !label.startsWith("tpo::"),
      ) ?? [];
    return [...priorityLabels, ...tpoLabels, ...otherLabels];
  };

  const handleCreateMergeRequest = (e: MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(false);
    addNotification({
      title: "Create Merge Request",
      description: `Creating MR for issue #${task.iid}`,
    });
    createMergeRequest(task.id, task.iid.toString());
  };

  const handleAssignMergeRequest =
    (mrId: number, branch: string) => (e: MouseEvent) => {
      e.stopPropagation();
      setMenuOpen(false);
      addNotification({
        title: "Assign Merge Request",
        description: `Assigning MR for ${branch}`,
      });
      // TODO: Implement assign merge request logic
    };

  const handleRequestReview = async (
    task: ITaskV2,
    mrIid: number,
    branch: string,
  ) => {
    setMenuOpen(false);
    addNotification({
      title: "Request Review",
      description: `Requesting review for ${branch}`,
    });

    await startReview(task, mrIid);
    openModal(ModalType.AssignReview);
  };

  return (
    <div
      id={`task-card-${task.id}`}
      ref={sortable}
      class={styles.card}
      classList={{
        [styles.dragging]: sortable.isActiveDraggable,
        [styles.active]: props.active,
      }}
      style={{
        transform: sortable.transform
          ? `translate3d(${sortable.transform.x}px, ${sortable.transform.y}px, 0)`
          : undefined,
        transition: sortable.isActiveDraggable ? "none" : "transform 200ms",
        "view-transition-name": "card-" + task.id,
      }}
      onClick={(e) => {
        openDetailModal(task.id);
        markTaskAsRead(task.id);
      }}
    >
      <Show when={task.notify}>
        <div class={styles.notifyBadge} />
      </Show>
      <div class={styles.cardHeader}>
        <h3 class={styles.title}>{task.title}</h3>
        <div
          style={{
            display: "flex",
            "align-items": "flex-start",
            gap: "var(--spacing-xs)",
          }}
        >
          <div>
            <div class={styles.issueId}>#{task.iid}</div>
          </div>
          <div class={styles.menuContainer} ref={menuRef}>
            <button
              class={styles.menuButton}
              onClick={handleMenuToggle}
              title="Actions"
            >
              <i class="fa-solid fa-ellipsis-vertical"></i>
            </button>
            <Show when={menuOpen()}>
              <div class={styles.dropdown}>
                <button
                  class={styles.dropdownItem}
                  onClick={handleCreateMergeRequest}
                >
                  <i class="fa-solid fa-code-branch"></i>
                  <span>Create Merge Request</span>
                </button>

                <Show when={(task?.merge_requests?.length ?? 0) > 0}>
                  <div class={styles.dropdownDivider}></div>
                  <For each={task.merge_requests}>
                    {(mr) => (
                      <div class={styles.dropdownItemGroup}>
                        <div class={styles.dropdownItemLabel}>
                          !{mr.source_branch}
                        </div>
                        <button
                          class={`${styles.dropdownItem} ${styles.dropdownSubItem}`}
                          onClick={handleAssignMergeRequest(
                            mr.id,
                            mr.source_branch,
                          )}
                        >
                          <i class="fa-solid fa-user-plus"></i>
                          <span>Assign</span>
                        </button>
                        <button
                          class={`${styles.dropdownItem} ${styles.dropdownSubItem}`}
                          onClick={async (e) => {
                            e.stopPropagation();
                            await handleRequestReview(
                              task,
                              mr.iid,
                              mr.source_branch,
                            );
                          }}
                        >
                          <i class="fa-solid fa-eye"></i>
                          <span>Request Review</span>
                        </button>
                      </div>
                    )}
                  </For>
                </Show>
              </div>
            </Show>
          </div>
        </div>
      </div>

      <Show when={task?.description}>
        <p class={styles.description}>{task.description.substring(0, 100)}</p>
      </Show>

      <Show when={sortedLabels().length > 0}>
        <div class={styles.labelsSection}>
          <For
            each={
              showAllLabels()
                ? sortedLabels()
                : sortedLabels().slice(0, MAX_VISIBLE_LABELS)
            }
          >
            {(label) => (
              <div
                class={`${styles.label} ${styles[`color-${getLabelColor(label)}`]}`}
              >
                {label}
              </div>
            )}
          </For>
          <Show when={sortedLabels().length > MAX_VISIBLE_LABELS}>
            <button
              class={styles.labelMore}
              onClick={(e) => {
                e.stopPropagation();
                setShowAllLabels(!showAllLabels());
              }}
            >
              {showAllLabels()
                ? "show less"
                : `+${sortedLabels().length - MAX_VISIBLE_LABELS} more`}
            </button>
          </Show>
        </div>
      </Show>

      <div class={styles.peopleSection}>
        <Show when={task.assignees?.length > 0}>
          <div class={styles.peopleGroup}>
            <i class="fa-solid fa-user-check" title="Assignees"></i>
            <div class={styles.avatarStack}>
              <For each={task.assignees}>
                {(user) => (
                  <img
                    src={user.avatar_url}
                    class={styles.avatar}
                    title={user.name}
                    alt={user.name}
                  />
                )}
              </For>
            </div>
          </div>
        </Show>
      </div>

      <Show when={task?.merge_requests?.length}>
        <div class={styles.mergeRequestsSection}>
          <For each={task?.merge_requests}>
            {(mr) => (
              <div class={styles.mergeRequest}>
                <div class={styles.mergeRequestHeader}>
                  <div class={styles.branchInfo}>
                    <i class="fa-solid fa-code-branch"></i>
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        navigator.clipboard.writeText(mr.source_branch);
                        addNotification({
                          type: "success",
                          title: "Copied branch",
                        });
                      }}
                      class={styles.mrLink}
                    >
                      !{mr.source_branch}
                    </div>
                  </div>

                  <div class={styles.peopleSection}>
                    <Show when={mr.assignees?.length > 0}>
                      <div class={styles.peopleGroup}>
                        <i class="fa-solid fa-user-check" title="Assignees"></i>
                        <div class={styles.avatarStack}>
                          <For each={mr.assignees}>
                            {(user) => (
                              <img
                                src={user.avatar_url}
                                class={styles.avatar}
                                title={user.name}
                                alt={user.name}
                              />
                            )}
                          </For>
                        </div>
                      </div>
                    </Show>

                    <Show when={mr.reviewers?.length > 0}>
                      <div class={styles.peopleGroup}>
                        <i class="fa-solid fa-eye" title="Reviewers"></i>
                        <div class={styles.avatarStack}>
                          <For each={mr.reviewers}>
                            {(user) => (
                              <div class={styles.reviewer}>
                                <img
                                  src={user.avatar_url}
                                  class={styles.avatar}
                                  title={user.name}
                                  alt={user.name}
                                />
                                <div
                                  class={styles.approvalBadge}
                                  classList={{
                                    [styles[user.state]]: true,
                                  }}
                                />
                              </div>
                            )}
                          </For>
                        </div>
                      </div>
                    </Show>
                  </div>
                </div>

                <div class={styles.statusRow}>
                  <Show
                    when={
                      userStore.user &&
                      mr.reviewers.some((r) => r.id === userStore.user?.id)
                    }
                  >
                    <div class={styles.reviewRequestBadge}>
                      <i class="fa-regular fa-bell"></i>review
                    </div>
                  </Show>

                  <Show when={mr.pipeline != null}>
                    <div
                      class={styles.pipelineStatus}
                      classList={{ [styles[mr.pipeline!.status]]: true }}
                    >
                      {getStatusIcon(mr.pipeline!.status)}
                      <span class={styles.statusText}>
                        {mr.pipeline!.status}
                      </span>
                    </div>
                  </Show>

                  <div class={styles.mrStatus}>
                    <span>
                      {mr.state.charAt(0).toUpperCase() + mr.state.slice(1)}
                    </span>
                  </div>
                </div>

                <Show when={mr.draft}>
                  <div class={styles.ribbon}>Draft</div>
                </Show>
              </div>
            )}
          </For>
        </div>
      </Show>

      <Show
        when={dayjs().month() === 11 && random(task.id.toString() || "") > 0.6}
      >
        <img src={xMasHat} class={styles.xMasHat} />
      </Show>
    </div>
  );
};

export default TaskCard;
