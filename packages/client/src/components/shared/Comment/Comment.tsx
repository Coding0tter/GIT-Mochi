import { createSignal } from "solid-js";
import { parseMarkdown } from "../../../utils/parseMarkdown";
import Badge from "../Badge/Badge";
import styles from "./Comment.module.css";
import type { IComment } from "shared/types/task";
import { settingsStore } from "@client/stores/settings.store";

interface CommentProps {
  comment: IComment;
  selected: () => boolean;
  id: string;
}

const CommentCard = ({ comment, selected, id }: CommentProps) => {
  const [expand, setExpand] = createSignal<boolean>(false);

  return (
    <div
      id={id}
      class={`${styles.card} ${comment.resolved ? styles.resolved : ""} ${
        comment.system ? styles.system : styles.user
      } ${selected() ? styles.selected : ""}`}
    >
      <div class={styles.commentHeader}>
        {comment.system ? (
          <>
            <div class={styles.commentAvatar}>
              <img
                src={`${settingsStore.gitlab_url}/uploads/-/system/appearance/header_logo/1/ltdoheader2.png`}
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
            <span class={styles.commentAuthor}>{comment.author.name}</span>
          </>
        )}

        {comment.resolved && <Badge type="default">Resolved</Badge>}
      </div>
      <div>
        <p
          class={`${styles.commentText} ${expand() ? "" : styles.clamped}`}
          innerHTML={parseMarkdown(comment.body)}
        />
        {comment.body.length > 150 && (
          <button
            onClick={() => setExpand(!expand())}
            class={styles.expandButton}
          >
            {expand() ? "Show less" : "Show more"}
          </button>
        )}
      </div>
    </div>
  );
};

export default CommentCard;
