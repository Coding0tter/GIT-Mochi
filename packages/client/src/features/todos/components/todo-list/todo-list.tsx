import { For, Show } from "solid-js";
import styles from "./todo-list.module.css";
import TodoEmpty from "@client/features/todos/components/empty/empty.tsx";
import TodoItem from "@client/features/todos/components/todo-item/todo-item.tsx";
import { sortedTodos } from "@client/features/todos/stores/todo.store.ts";

const TodoList = () => {
  return (
    <Show when={sortedTodos().length > 0} fallback={<TodoEmpty />}>
      <div class={styles.todoList}>
        <For each={sortedTodos()}>{(todo) => <TodoItem todo={todo} />}</For>
      </div>
    </Show>
  );
};

export default TodoList;
