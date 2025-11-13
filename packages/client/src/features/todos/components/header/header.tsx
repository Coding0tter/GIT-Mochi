import { sortedTodos } from "@client/features/todos/stores/todo.store.ts";
import styles from "./header.module.css";

const TodoHeader = () => {
  return (
    <div class={styles.todosHeader}>
      <h1>Todos</h1>
      <span class={styles.todoCount}>{sortedTodos().length}</span>
    </div>
  );
};

export default TodoHeader;
