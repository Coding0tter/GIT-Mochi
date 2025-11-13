import type { BaseModalProps } from "@client/components/modals/BaseModal/BaseModal.tsx";
import BaseModal from "@client/components/modals/BaseModal/BaseModal.tsx";
import { kanbanStore } from "@client/features/kanban/stores/kanban.store.ts";
import { createSignal, For, onMount, Show } from "solid-js";
import styles from "./detail-modal.module.css";
import Button from "@client/components/shared/Button/Button.tsx";
import {
  getDiscussionByIid,
  getDiscussions,
} from "@client/shared/stores/discussion.store.ts";
import dayjs from "dayjs";
import { parseMarkdown } from "@client/utils/parseMarkdown.ts";
import { addNotification } from "@client/services/notificationService.ts";

interface DetailModalProps extends BaseModalProps {}

const DetailModal = (props: DetailModalProps) => {
  const [loading, setLoading] = createSignal<boolean>(true);
  const task = kanbanStore.task!;

  onMount(async () => {
    const mrIids = task.merge_requests?.map((mr) => mr.iid) || [];

    await getDiscussions(task.iid, mrIids);
    setLoading(false);
  });

  return (
    <BaseModal {...props} closeText="Close">
      <div class={styles.header}>
        <h2>{task.title}</h2>
      </div>
      <Button onClick={() => window.open(task.web_url, "_blank")}>
        <i class="fa-brands fa-gitlab"></i> View Issue on GitLab
      </Button>
      <div class={styles.content}>
        <div class={styles.column}>
          <Show when={task.merge_requests?.length}>
            <div>
              <h3>
                Merge Request{task.merge_requests?.length! > 1 ? "s" : ""}
              </h3>
              <For each={task.merge_requests}>
                {(mr) => (
                  <div class={styles.mergeRequestCard}>
                    <div class={styles.mergeRequestHeader}>
                      <div>
                        <div
                          onClick={() => {
                            navigator.clipboard.writeText(mr.source_branch);
                            addNotification({
                              type: "success",
                              description: `Copied branch name "${mr.source_branch}" to clipboard.`,
                            });
                          }}
                          class={styles.branchName}
                        >
                          <i class="fa-solid fa-code-branch"></i>
                          {mr.source_branch}
                        </div>
                        <Button
                          onClick={() => window.open(mr.web_url, "_blank")}
                          type="secondary"
                        >
                          <i class="fa-brands fa-gitlab"></i> View MR on GitLab
                        </Button>

                        <div class={styles.mrTitle}>{mr.title}</div>
                      </div>
                      <div
                        class={`${styles.pipelineStatus} ${styles[mr.pipeline?.status || "none"]}`}
                      >
                        <i
                          class={`fa-solid ${
                            mr.pipeline?.status === "success"
                              ? "fa-circle-check"
                              : mr.pipeline?.status === "failed"
                                ? "fa-circle-xmark"
                                : mr.pipeline?.status === "running"
                                  ? "fa-spinner fa-spin"
                                  : "fa-circle-question"
                          }`}
                        ></i>
                        {mr.pipeline?.status || "No Pipeline"}
                      </div>
                    </div>
                    <div class={styles.peopleSection}>
                      <div class={styles.peopleGroup}>
                        <h4>
                          <i class="fa-solid fa-user"></i> Assignees
                        </h4>
                        <Show
                          when={mr.assignees && mr.assignees.length > 0}
                          fallback={<div class={styles.noData}>None</div>}
                        >
                          <For each={mr.assignees}>
                            {(assignee) => (
                              <div class={styles.personCard}>
                                <div class={styles.reviewerInfo}>
                                  <img
                                    src={assignee.avatar_url}
                                    alt={assignee.name}
                                    class={styles.avatar}
                                  />
                                  <span class={styles.personName}>
                                    {assignee.name}
                                  </span>
                                </div>
                              </div>
                            )}
                          </For>
                        </Show>
                      </div>
                      <div class={styles.peopleGroup}>
                        <h4>
                          <i class="fa-solid fa-code-pull-request"></i>{" "}
                          Reviewers
                        </h4>
                        <Show
                          when={mr.reviewers && mr.reviewers.length > 0}
                          fallback={<div class={styles.noData}>None</div>}
                        >
                          <For each={mr.reviewers}>
                            {(reviewer) => (
                              <div class={styles.personCard}>
                                <div class={styles.reviewerInfo}>
                                  <img
                                    src={reviewer.avatar_url}
                                    alt={reviewer.name}
                                    class={styles.avatar}
                                  />
                                  <span class={styles.personName}>
                                    {reviewer.name}
                                  </span>
                                </div>
                                <div
                                  class={styles.approvalBadge}
                                  classList={{
                                    [styles[reviewer.state]]: true,
                                  }}
                                >
                                  {reviewer.state}
                                </div>
                              </div>
                            )}
                          </For>
                        </Show>
                      </div>
                    </div>
                    <Show
                      when={!loading()}
                      fallback={
                        <div
                          class={`${styles.commentsContainer} ${styles.mrComments}`}
                        >
                          <div class={styles.noData}>
                            <i class="fa-solid fa-spinner fa-spin"></i> Loading
                            comments...
                          </div>
                        </div>
                      }
                    >
                      <Show
                        when={getDiscussionByIid(mr.iid).length > 0}
                        fallback={
                          <div class={styles.noData}>
                            No MR comments available.
                          </div>
                        }
                      >
                        <div class={styles.peopleGroup}>
                          <h4>
                            <i class="fa-solid fa-comments"></i> MR Comments
                          </h4>
                          <div
                            class={`${styles.commentsContainer} ${styles.mrComments}`}
                          >
                            <For each={getDiscussionByIid(mr.iid)}>
                              {(discussion) => (
                                <div class={styles.discussionThread}>
                                  <For each={discussion.notes}>
                                    {(note, index) => (
                                      <div
                                        class={`${styles.commentCard} ${note.type === "DiffNote" ? styles.diffNote : ""} ${index() > 0 ? styles.reply : ""}`}
                                      >
                                        <div class={styles.commentHeader}>
                                          <span class={styles.commentAuthor}>
                                            @{note.author.username} -{" "}
                                            {dayjs(note.created_at).format(
                                              "DD.MM.YYYY HH:mm",
                                            )}
                                          </span>
                                          <Show
                                            when={
                                              index() === 0 && note.resolvable
                                            }
                                          >
                                            <div class={styles.commentActions}>
                                              <span
                                                class={`${styles.resolvedBadge} ${note.resolved ? styles.resolved : styles.unresolved}`}
                                              >
                                                <i
                                                  class={`fa-solid ${note.resolved ? "fa-circle-check" : "fa-circle-exclamation"}`}
                                                ></i>
                                                {note.resolved
                                                  ? "Resolved"
                                                  : "Unresolved"}
                                              </span>
                                              <Show when={!note.resolved}>
                                                <button
                                                  class={styles.resolveButton}
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    // TODO: Implement resolve functionality
                                                    console.log(
                                                      "Resolve discussion:",
                                                      discussion.id,
                                                    );
                                                  }}
                                                >
                                                  <i class="fa-solid fa-check"></i>
                                                  Resolve
                                                </button>
                                              </Show>
                                            </div>
                                          </Show>
                                        </div>
                                        <div
                                          class={styles.commentBody}
                                          innerHTML={parseMarkdown(note.body)}
                                        />
                                        <Show when={note.type === "DiffNote"}>
                                          <div class={styles.diffContext}>
                                            <i class="fa-solid fa-file-code"></i>
                                            {note.position?.new_path} on line{" "}
                                            {note.position?.new_line}
                                          </div>
                                        </Show>
                                      </div>
                                    )}
                                  </For>
                                </div>
                              )}
                            </For>
                          </div>
                        </div>
                      </Show>
                    </Show>
                  </div>
                )}
              </For>
            </div>
          </Show>
          <hr />
          <div class={styles.descriptionSection}>
            <h4>
              <i class="fa-solid fa-align-left"></i> Description
            </h4>
            <div
              class={styles.descriptionContent}
              innerHTML={
                parseMarkdown(task.description) || "No description available"
              }
            />
          </div>
        </div>
        <div class={styles.column}>
          <h4>
            <i class="fa-solid fa-message"></i> Issue Comments
          </h4>
          <Show
            when={!loading()}
            fallback={
              <div
                classList={{
                  [styles.commentsContainer]: true,
                  [styles.issueComments]: true,
                }}
              >
                <div class={styles.noData}>
                  <i class="fa-solid fa-spinner fa-spin"></i> Loading
                  comments...
                </div>
              </div>
            }
          >
            <Show
              when={getDiscussionByIid(task.iid).length > 0}
              fallback={<div class={styles.noData}>No comments available.</div>}
            >
              <div
                classList={{
                  [styles.commentsContainer]: true,
                  [styles.issueComments]: true,
                }}
              >
                <For each={getDiscussionByIid(task.iid)}>
                  {(discussion) => (
                    <div class={styles.discussionThread}>
                      <For each={discussion.notes}>
                        {(note, index) => (
                          <div
                            class={`${styles.commentCard} ${index() > 0 ? styles.reply : ""}`}
                          >
                            <div class={styles.commentHeader}>
                              <span class={styles.commentAuthor}>
                                @{note.author.username} -{" "}
                                {dayjs(note.created_at).format(
                                  "DD.MM.YYYY HH:mm",
                                )}
                              </span>
                              <Show when={index() === 0 && note.resolvable}>
                                <div class={styles.commentActions}>
                                  <span
                                    class={`${styles.resolvedBadge} ${note.resolved ? styles.resolved : styles.unresolved}`}
                                  >
                                    <i
                                      class={`fa-solid ${note.resolved ? "fa-circle-check" : "fa-circle-exclamation"}`}
                                    ></i>
                                    {note.resolved ? "Resolved" : "Unresolved"}
                                  </span>
                                  <Show when={!note.resolved}>
                                    <button
                                      class={styles.resolveButton}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        // TODO: Implement resolve functionality
                                        console.log(
                                          "Resolve discussion:",
                                          discussion.id,
                                        );
                                      }}
                                    >
                                      <i class="fa-solid fa-check"></i>
                                      Resolve
                                    </button>
                                  </Show>
                                </div>
                              </Show>
                            </div>
                            <div
                              class={styles.commentBody}
                              innerHTML={parseMarkdown(note.body)}
                            />
                          </div>
                        )}
                      </For>
                    </div>
                  )}
                </For>
              </div>
            </Show>
          </Show>
        </div>
      </div>
    </BaseModal>
  );
};

export default DetailModal;
