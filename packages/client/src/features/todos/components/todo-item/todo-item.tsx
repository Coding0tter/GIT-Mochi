import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { createMemo, Show } from "solid-js";
import styles from "./todo-item.module.css";
import type { GitlabTodo } from "shared/types/gitlab/todo.ts";
import Button from "@client/components/shared/Button/Button.tsx";
import {
  getActionInfo,
  getTypeInfo,
} from "@client/features/todos/utils/helper.ts";
import { markTodoDone } from "@client/features/todos/stores/todo.store.ts";

dayjs.extend(relativeTime);

const TodoItem = (props: { todo: GitlabTodo }) => {
  const todo = props.todo;

  const actionInfo = createMemo(() => getActionInfo(todo.action_name));
  const typeInfo = createMemo(() => getTypeInfo(todo.target_type));

  const handleDone = async () => {
    await markTodoDone(todo.id);
  };

  return (
    <div class={styles.todoItem}>
      <div
        class={styles.todoContent}
        onClick={() => window.open(todo.target_url)}
      >
        <div class={styles.todoMeta}>
          <div
            class={styles.actionBadge}
            style={{
              "background-color": actionInfo().color,
            }}
          >
            <span class={styles.actionIcon}>{actionInfo().icon}</span>
            <span class={styles.actionBadgeLabel}>{actionInfo().label}</span>
          </div>
          <div class={styles.todoType}>
            <span class={styles.typeIcon} style={{ color: typeInfo().color }}>
              {typeInfo().icon}
            </span>
            <span class={styles.typeLabel}>{typeInfo().label}</span>
          </div>
          <Show
            when={
              todo.target_type === "Issue" ||
              todo.target_type === "MergeRequest"
            }
          >
            <span class={styles.todoIid}>#{todo.target.iid}</span>
          </Show>
          <span class={styles.todoDivider}>·</span>
          <span class={styles.todoTime}>
            {dayjs(todo.created_at).fromNow()}
          </span>
        </div>

        <h3 class={styles.todoTitle}>{todo.target.title}</h3>

        <div class={styles.todoAction}>
          <img
            src={todo.author.avatar_url}
            alt={todo.author.name}
            class={styles.authorAvatar}
          />
          <span class={styles.authorName}>{todo.author.name}</span>
          <span class={styles.actionLabel}>{actionInfo().text}</span>
        </div>

        <Show when={todo.body}>
          <div class={styles.todoBody}>{todo.body}</div>
        </Show>
      </div>

      <div class={styles.todoActions}>
        <Button onClick={handleDone} type="default">
          <i class="fa-solid fa-check"></i>
        </Button>
      </div>
    </div>
  );
};

export default TodoItem;
