import {
  todoStore,
  fetchTodos,
} from "@client/features/todos/stores/todo.store.ts";
import styles from "./error.module.css";

const TodoError = () => {
  return (
    <div class={styles.errorState}>
      <div class={styles.errorIcon}>⚠️</div>
      <h3>Error loading todos</h3>
      <p>{todoStore.errors.fetchTodos}</p>
      <button onClick={() => fetchTodos()} class={styles.retryButton}>
        Try Again
      </button>
    </div>
  );
};

export default TodoError;
