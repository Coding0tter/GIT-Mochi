import { createSignal, For, onCleanup, onMount, Show } from "solid-js";
import Card from "../Card/Card";
import styles from "./DiscussionCard.module.css";
import Badge from "../Badge/Badge";
import { parseMarkdown } from "../../../utils/parseMarkdown";
import dayjs from "dayjs";
import type { IDiscussion } from "shared/types/task";
import { modalStore, ModalType } from "@client/stores/modalStore";
import { settingsStore } from "@client/stores/settings.store";

interface DiscussionCardProps {
  discussion: IDiscussion;
  selected: () => boolean;
  id: string;
  focusThread: (value: boolean) => void;
}

const DiscussionCard = (props: DiscussionCardProps) => {
  const firstNote = props.discussion.notes?.at(0);
  const [expand, setExpand] = createSignal<boolean>(false);
  const [showThread, setShowThread] = createSignal<boolean>(false);
  const [threadIndex, setThreadIndex] = createSignal<number>(0);

  onMount(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      if (
        !props.selected() ||
        modalStore.activeModals.includes(ModalType.Reply)
      )
        return;

      if (event.code === "Space") {
        event.preventDefault();

        setExpand(!expand());
      } else if (event.key === "l") {
        setShowThread(true);
        props.focusThread(true);
      } else if (event.key === "h") {
        setShowThread(false);
        props.focusThread(false);
      } else if (event.key === "j" && showThread()) {
        event.preventDefault();

        setThreadIndex(
          Math.min(threadIndex() + 1, props.discussion.notes!.length - 2),
        );
      } else if (event.key === "k" && showThread()) {
        event.preventDefault();

        setThreadIndex(Math.max(threadIndex() - 1, 0));
      }

      const thread = document.getElementById(
        `thread-${props.id}-${threadIndex()}`,
      );
      thread?.scrollIntoView({ behavior: "smooth", block: "center" });
    };

    window.addEventListener("keydown", handleKeydown);

    onCleanup(() => {
      window.removeEventListener("keydown", handleKeydown);
    });
  });

  return (
    <div id={props.id}>
      <Card
        class={
          props.discussion.notes?.at(0)?.resolved ? styles.resolvedCard : ""
        }
        selectedBorderColor={
          props.discussion.notes?.at(0)?.resolved ? "green" : "blue"
        }
        selected={props.selected}
      >
        <Show when={props.discussion.individual_note}>
          <div class={styles.header}>
            {firstNote?.system ? (
              <>
                <div class={styles.discussionAvatar}>
                  <i class="fa-solid fa-robot"></i>
                </div>
                <span class={styles.discussionAuthor}>
                  System (
                  {dayjs(firstNote?.created_at).format("DD.MM.YYYY HH:mm")})
                </span>
              </>
            ) : (
              <>
                <div class={styles.discussionAvatar}>
                  <img
                    src={
                      firstNote?.author.avatar_url ||
                      `https://avatar.vercel.sh/otter`
                    }
                  />
                </div>
                <span class={styles.discussionAuthor}>
                  {firstNote?.author.name} (
                  {dayjs(firstNote?.created_at).format("DD.MM.YYYY HH:mm")})
                </span>
              </>
            )}

            {firstNote?.resolved && <Badge type="default">Resolved</Badge>}
          </div>
          <div>
            <p
              class={`${styles.discussionText} ${
                expand() ? "" : styles.clamped
              }`}
              innerHTML={parseMarkdown(firstNote?.body || "")}
            />
            {firstNote?.body && firstNote?.body.length > 150 && (
              <button
                onClick={() => setExpand(!expand())}
                class={styles.expandButton}
              >
                {expand() ? "Show less" : "Show more"}
              </button>
            )}
          </div>
        </Show>

        <Show when={!props.discussion.individual_note}>
          <div class={styles.header}>
            {firstNote?.system ? (
              <>
                <div class={styles.discussionAvatar}>
                  <img
                    src={`${settingsStore.gitlab_url}/uploads/-/system/appearance/header_logo/1/ltdoheader2.png`}
                  />
                </div>
                <span class={styles.discussionAuthor}>
                  System (
                  {dayjs(firstNote?.created_at).format("DD.MM.YYYY HH:mm")})
                </span>
              </>
            ) : (
              <>
                <div class={styles.discussionAvatar}>
                  <img
                    src={
                      firstNote?.author.avatar_url ||
                      `https://avatar.vercel.sh/otter`
                    }
                  />
                </div>
                <span class={styles.discussionAuthor}>
                  {firstNote?.author.name} (
                  {dayjs(firstNote?.created_at).format("DD.MM.YYYY HH:mm")})
                </span>
              </>
            )}
            <div class={styles.resolvedBadge}>
              {firstNote?.resolved && <Badge type="low">Resolved</Badge>}
              {firstNote?.resolvable && <Badge type="medium">Resolvable</Badge>}
            </div>
          </div>
          <div>
            <p
              class={`${styles.discussionText} ${
                expand() ? "" : styles.clamped
              }`}
              innerHTML={parseMarkdown(firstNote?.body || "")}
            />
            {firstNote?.body && firstNote?.body.length > 150 && (
              <button
                onClick={() => setExpand(!expand())}
                class={styles.expandButton}
              >
                {expand() ? "Show less" : "Show more"}
              </button>
            )}
          </div>
          <Show
            when={props.discussion.notes && props.discussion.notes?.length > 1}
          >
            <Show
              when={showThread()}
              fallback={
                <Badge
                  type="default"
                  onClick={() => setShowThread(!showThread())}
                >
                  {props.discussion.notes?.length! - 1} more{" "}
                  {props.discussion.notes?.length! - 1 === 1
                    ? "reply"
                    : "replies"}
                </Badge>
              }
            >
              <div class={styles.discussionThread}>
                <For each={props.discussion.notes?.slice(1)}>
                  {(note, index) => (
                    <div
                      id={`thread-${props.id}-${index()}`}
                      class={`${styles.discussionThreadNote} ${threadIndex() === index() ? styles.selected : ""}`}
                    >
                      <div class={styles.discussionThreadNoteHeader}>
                        {note.system ? (
                          <>
                            <div class={styles.discussionAvatar}>
                              <i class="fa-solid fa-robot"></i>
                            </div>
                            <span class={styles.discussionAuthor}>
                              System (
                              {dayjs(note.created_at).format(
                                "DD.MM.YYYY HH:mm",
                              )}
                              )
                            </span>
                          </>
                        ) : (
                          <>
                            <div class={styles.discussionAvatar}>
                              <img
                                src={
                                  note.author.avatar_url ||
                                  `https://avatar.vercel.sh/otter`
                                }
                              />
                            </div>
                            <span class={styles.discussionAuthor}>
                              {note.author.name} (
                              {dayjs(note.created_at).format(
                                "DD.MM.YYYY HH:mm",
                              )}
                              )
                            </span>
                          </>
                        )}
                      </div>
                      <p
                        class={`${styles.discussionText} ${
                          expand() ? "" : styles.clamped
                        }`}
                        innerHTML={parseMarkdown(note.body || "")}
                      />
                    </div>
                  )}
                </For>
              </div>
            </Show>
          </Show>
        </Show>
      </Card>
    </div>
  );
};

export default DiscussionCard;
