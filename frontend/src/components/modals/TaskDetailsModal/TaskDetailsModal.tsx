import { createSignal, onMount, onCleanup } from "solid-js";
import BaseModal, { BaseModalProps } from "../BaseModal/BaseModal";
import { modalStore } from "../../../stores/modalStore";
import DOMPurify from "dompurify";
import styles from "./TaskDetailsModal.module.css";
import Badge from "../../shared/Badge/Badge";
import { GIT_URL } from "../../../constants";
import { marked } from "marked";
import { uiStore } from "../../../stores/uiStore";

interface TaskDetailsModalProps extends BaseModalProps {}

const TaskDetailsModal = (props: TaskDetailsModalProps) => {
  const [expandedComments, toggleCommentExpansion] = createSignal<string[]>([]);
  const [selectedComment, setSelectedComment] = createSignal<number>(0);
  const [toggleSystemComments, setToggleSystemComments] = createSignal(false);
  const { selectedTask: task } = modalStore;

  onMount(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        toggleMore(selectedComment());
      }

      if (!task?.comments || task?.comments.length === 0) return;

      if (event.key === "j" || event.key === "ArrowDown") {
        if (selectedComment() < filteredComments().length - 1) {
          setSelectedComment(selectedComment() + 1);
        } else {
          setSelectedComment(0);
        }
      } else if (event.key === "k" || event.key === "ArrowUp") {
        if (selectedComment() > 0) {
          setSelectedComment(selectedComment() - 1);
        } else {
          setSelectedComment(filteredComments().length - 1);
        }
      } else if (event.key === "t") {
        setToggleSystemComments(!toggleSystemComments());
      } else if (event.shiftKey && event.key === "O") {
        window.open(task.web_url, "_blank");
      }

      const comment = document.getElementById(`comment-${selectedComment()}`);
      comment?.scrollIntoView({ behavior: "smooth", block: "center" });
    };

    window.addEventListener("keydown", handleKeyDown);

    onCleanup(() => {
      window.removeEventListener("keydown", handleKeyDown);
    });
  });

  const filteredComments = () => {
    return (
      task?.comments.filter(
        (comment) => toggleSystemComments() || !comment.system,
      ) || []
    );
  };

  const parseMarkdown = (input: string) => {
    const sanitized = DOMPurify.sanitize(input);
    const markdown = marked(sanitized, { async: false });

    console.log(sanitized);

    return markdown
      .replaceAll(
        'src="/',
        `src="${GIT_URL}/-/project/${uiStore.currentProject?.id}/`,
      )
      .replaceAll(
        /<img\s+src="([^"]+\.webm)"\s+alt="([^"]*)"\s*\/?>/g,
        '<video width="700" controls><source src="$1" type="video/webm"></video>',
      );
  };

  const toggleMore = (index: number) => {
    toggleCommentExpansion((prev) =>
      prev.includes(index.toString())
        ? prev.filter((i) => i !== index.toString())
        : [...prev, index.toString()],
    );
  };

  const getPriority = () => {
    const priorityLabel = task?.labels.find((label) =>
      label.includes("priority"),
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

            <div class={styles.card}>
              <p
                class={styles.descriptionText}
                innerHTML={parseMarkdown(task?.description || "")}
              />
            </div>

            <div class={styles.card}>
              <div class={styles.badgeContainer}>
                <Badge type="default">{task?.status}</Badge>
                {task?.type && <Badge type="default">{task?.type}</Badge>}
                {task?.milestoneName && (
                  <Badge type="default">{task?.milestoneName}</Badge>
                )}
              </div>
            </div>

            <div class={styles.card}>
              {task?.labels && task.labels.length > 0 && (
                <div class={styles.labelsContainer}>
                  <Badge type={getPriority()}>{getPriority()}</Badge>
                  {task?.labels
                    .filter((task) => !task.includes("priority"))
                    .map((label) => <Badge>{label}</Badge>)}
                </div>
              )}
            </div>
          </div>

          <div class={styles.divider} />

          <h3 class={styles.commentsHeader}>Comments</h3>
          {task?.comments && task.comments.length > 0 ? (
            <div class={styles.commentsContainer}>
              {filteredComments().map((comment, index) => (
                <div
                  id={`comment-${index}`}
                  class={`${styles.card} ${
                    comment.resolved ? styles.resolved : ""
                  } ${comment.system ? styles.system : styles.user} ${
                    selectedComment() === index ? styles.selected : ""
                  }`}
                >
                  <div class={styles.commentHeader}>
                    {comment.system ? (
                      <>
                        <div class={styles.commentAvatar}>
                          <img
                            src={`${GIT_URL}/uploads/-/system/appearance/header_logo/1/ltdoheader2.png`}
                          />
                        </div>
                        <span class={styles.commentAuthor}>System</span>
                      </>
                    ) : (
                      <>
                        <div class={styles.commentAvatar}>
                          <img
                            src={
                              comment.author.avatar_url ||
                              `https://avatar.vercel.sh/${comment.author.username}`
                            }
                          />
                        </div>
                        <span class={styles.commentAuthor}>
                          {comment.author.name}
                        </span>
                      </>
                    )}

                    {comment.resolved && <Badge type="default">Resolved</Badge>}
                  </div>
                  <div>
                    <p
                      class={`${styles.commentText} ${
                        expandedComments().includes(index.toString())
                          ? ""
                          : styles.clamped
                      }`}
                      innerHTML={parseMarkdown(comment.body)}
                    />
                    {comment.body.length > 150 && (
                      <button
                        onClick={() => toggleMore(index)}
                        class={styles.expandButton}
                      >
                        {expandedComments().includes(index.toString())
                          ? "Show less"
                          : "Show more"}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p class={styles.descriptionText}>No comments yet.</p>
          )}
        </div>
      </div>
    </BaseModal>
  );
};

export default TaskDetailsModal;
