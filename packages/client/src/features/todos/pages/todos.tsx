import Loading from "@client/components/shared/Loading/Loading.tsx";
import TodoError from "@client/features/todos/components/error/error.tsx";
import TodoHeader from "@client/features/todos/components/header/header.tsx";
import TodoList from "@client/features/todos/components/todo-list/todo-list.tsx";
import { LoadingTarget, uiStore } from "@client/stores/uiStore.ts";
import { onCleanup, onMount, Show } from "solid-js";
import styles from "./todos.module.css";
import {
  fetchTodos,
  sortedTodos,
  todoStore,
} from "@client/features/todos/stores/todo.store.ts";

const Todos = () => {
  let fetchInterval: ReturnType<typeof setInterval>;

  onMount(() => {
    fetchTodos();
    fetchInterval = setInterval(() => {
      console.log("Refetching todos...");
      fetchTodos();
    }, 60_000);
  });

  onCleanup(() => {
    clearInterval(fetchInterval);
  });

  return (
    <Show
      when={
        uiStore.loadingTarget !== LoadingTarget.Todos &&
        sortedTodos().length !== 0
      }
      fallback={<Loading />}
    >
      <Show when={!todoStore.errors.fetchTodos} fallback={<TodoError />}>
        <div class={styles.todosWrapper}>
          <TodoHeader />

          <div class={styles.todosContainer}>
            <TodoList />
          </div>
        </div>
      </Show>
    </Show>
  );
};

export default Todos;
