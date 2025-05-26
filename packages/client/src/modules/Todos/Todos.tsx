import {
  fetchTodosAsync,
  todoStore,
  type GitlabTodo,
} from "@client/stores/todoStore";
import { createSignal, For, onMount, Show } from "solid-js";
import styles from "./Todos.module.css";
import { LoadingTarget, uiStore } from "@client/stores/uiStore";
import Badge from "@client/components/shared/Badge/Badge";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const Todos = () => {
  const [filter, setFilter] = createSignal<"all" | "pending" | "done">(
    "pending",
  );
  const [groupBy, setGroupBy] = createSignal<"action" | "type" | "none">(
    "action",
  );
  const [collapsedGroups, setCollapsedGroups] = createSignal<Set<string>>(
    new Set(),
  );

  onMount(async () => {
    await fetchTodosAsync();
    toggleAllGroups(true);
  });

  const filteredTodos = () => {
    const todos = todoStore.todos as GitlabTodo[];
    if (filter() === "all") return todos;

    return todos.filter((todo) => todo.state === filter());
  };

  const getActionIcon = (actionName: string) => {
    switch (actionName) {
      case "assigned":
        return "👤";
      case "mentioned":
        return "@";
      case "marked":
        return "📝";
      case "approval_required":
        return "✅";
      case "review_requested":
        return "👀";
      default:
        return "📋";
    }
  };

  const getTypeIcon = (targetType: string) => {
    switch (targetType) {
      case "Issue":
        return "🐛";
      case "MergeRequest":
        return "🔀";
      case "Epic":
        return "📋";
      default:
        return "📄";
    }
  };

  const toggleGroup = (groupName: string) => {
    setCollapsedGroups((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(groupName)) {
        newSet.delete(groupName);
      } else {
        newSet.add(groupName);
      }
      return newSet;
    });
  };

  const handleTodoClick = (todo: GitlabTodo) => {
    window.open(todo.target_url, "_blank");
  };

  const isGroupCollapsed = (groupName: string) => {
    return collapsedGroups().has(groupName);
  };

  const toggleAllGroups = (collapse: boolean) => {
    if (collapse) {
      setCollapsedGroups(new Set(Object.keys(groupedTodos())));
    } else {
      setCollapsedGroups(new Set<string>());
    }
  };

  const pendingCount = () =>
    todoStore.todos.filter((t: GitlabTodo) => t.state === "pending").length;

  const groupedTodos = () => {
    const todos = filteredTodos();

    if (groupBy() === "none") {
      return { "All Todos": todos };
    }

    if (groupBy() === "action") {
      return todos.reduce(
        (groups, todo) => {
          const key = `${getActionIcon(todo.action_name)} ${todo.action_name}`;
          if (!groups[key]) groups[key] = [];
          groups[key].push(todo);
          return groups;
        },
        {} as Record<string, GitlabTodo[]>,
      );
    }

    if (groupBy() === "type") {
      return todos.reduce(
        (groups, todo) => {
          const key = todo.target_type;
          if (!groups[key]) groups[key] = [];
          groups[key].push(todo);
          return groups;
        },
        {} as Record<string, GitlabTodo[]>,
      );
    }

    return { "All Todos": todos };
  };

  return (
    <Show
      when={uiStore.loadingTarget !== LoadingTarget.Todos}
      fallback={
        <div class={styles.loading}>
          <div class={styles.dots}>
            <div class={styles.dot}></div>
            <div class={styles.dot}></div>
            <div class={styles.dot}></div>
          </div>
        </div>
      }
    >
      <Show
        when={!todoStore.error}
        fallback={
          <div class={styles.errorState}>
            <div class={styles.errorIcon}>⚠️</div>
            <h3>Error loading todos</h3>
            <p>{todoStore.error}</p>
            <button
              onClick={async () => await fetchTodosAsync()}
              class={styles.retryButton}
            >
              Try Again
            </button>
          </div>
        }
      >
        <div class={styles.todosWrapper}>
          <div class={styles.todosHeader}>
            <div class={styles.todosTitle}>
              <h1>GitLab Todos</h1>
              <div class={styles.todosStats}>
                <Badge type="high">{pendingCount()} pending</Badge>
              </div>
            </div>

            <div class={styles.todosControls}>
              <div class={styles.filterGroup}>
                <label>Filter:</label>
                <select
                  value={filter()}
                  onChange={(e) => setFilter(e.currentTarget.value as any)}
                >
                  <option value="pending">Pending</option>
                  <option value="done">Done</option>
                  <option value="all">All</option>
                </select>
              </div>

              <div class={styles.filterGroup}>
                <label>Group by:</label>
                <select
                  value={groupBy()}
                  onChange={(e) => setGroupBy(e.currentTarget.value as any)}
                >
                  <option value="action">Action</option>
                  <option value="type">Type</option>
                  <option value="none">None</option>
                </select>
              </div>
            </div>
          </div>

          <div class={styles.todosContainer}>
            <Show
              when={filteredTodos().length > 0}
              fallback={
                <div class={styles.emptyState}>
                  <div class={styles.emptyIcon}>✨</div>
                  <h3>No todos found</h3>
                  <p>
                    You're all caught up! No {filter()} todos at the moment.
                  </p>
                </div>
              }
            >
              <For each={Object.entries(groupedTodos())}>
                {([groupName, todos]) => (
                  <Show when={todos.length > 0}>
                    <div class={styles.todoGroup}>
                      <Show when={groupBy() !== "none"}>
                        <div
                          class={styles.groupHeader}
                          onClick={() => toggleGroup(groupName)}
                        >
                          <div class={styles.groupHeaderContent}>
                            <div class={styles.groupHeaderTitle}>
                              <i
                                class={`fa-solid ${isGroupCollapsed(groupName) ? "fa-chevron-right" : "fa-chevron-down"} ${styles.groupChevron}`}
                              ></i>
                              {groupName} ({todos.length})
                            </div>
                            <div class={styles.groupHeaderActions}>
                              <span class={styles.groupCount}>
                                {
                                  todos.filter((t) => t.state === "pending")
                                    .length
                                }{" "}
                                pending
                              </span>
                            </div>
                          </div>
                        </div>
                      </Show>

                      <div
                        class={`${styles.todoList} ${isGroupCollapsed(groupName) ? styles.collapsed : styles.expanded}`}
                      >
                        <For each={todos}>
                          {(todo) => (
                            <div
                              class={`${styles.todoItem} ${todo.state === "done" ? styles.done : ""}`}
                              onClick={() => handleTodoClick(todo)}
                            >
                              <div class={styles.todoIcon}>
                                {getActionIcon(todo.action_name)}
                              </div>

                              <div class={styles.todoContent}>
                                <div class={styles.todoHeader}>
                                  <div class={styles.todoAction}>
                                    <Badge type="custom">
                                      {todo.action_name}
                                    </Badge>
                                    <span class={styles.todoTime}>
                                      {dayjs(todo.created_at).fromNow()}
                                    </span>
                                  </div>

                                  <div class={styles.todoMeta}>
                                    <Badge type="outline">
                                      {getTypeIcon(todo.target_type)}{" "}
                                      {todo.target_type}
                                    </Badge>
                                    <Show when={groupBy() !== "action"}>
                                      <Badge type="secondary">
                                        {todo.action_name}
                                      </Badge>
                                    </Show>
                                  </div>
                                </div>

                                <div class={styles.todoTitle}>
                                  {todo.target.title}
                                </div>

                                <Show
                                  when={
                                    todo.target_type === "Issue" ||
                                    todo.target_type === "MergeRequest"
                                  }
                                >
                                  <div class={styles.todoIid}>
                                    #{todo.target.iid}
                                  </div>
                                </Show>

                                <Show when={todo.body}>
                                  <div class={styles.todoBody}>{todo.body}</div>
                                </Show>

                                <div class={styles.todoFooter}>
                                  <div class={styles.todoAuthor}>
                                    <img
                                      src={todo.author.avatar_url}
                                      alt={todo.author.name}
                                      class={styles.authorAvatar}
                                    />
                                    <span>{todo.author.name}</span>
                                  </div>

                                  <Show when={todo.target.state}>
                                    <Badge
                                      type={
                                        todo.target.state === "opened"
                                          ? "high"
                                          : todo.target.state === "closed"
                                            ? "low"
                                            : "medium"
                                      }
                                    >
                                      {todo.target.state}
                                    </Badge>
                                  </Show>
                                </div>
                              </div>
                            </div>
                          )}
                        </For>
                      </div>
                    </div>
                  </Show>
                )}
              </For>
            </Show>
          </div>
        </div>
      </Show>
    </Show>
  );
};

export default Todos;
