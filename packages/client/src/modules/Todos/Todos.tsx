import { fetchTodosAsync, todoStore } from "@client/stores/todoStore";
import { onMount } from "solid-js";
import styles from "./Todos.module.css";

const Todos = () => {
  onMount(async () => {
    await fetchTodosAsync();
  });

  return (
    <div class={styles.todoContainer}>
      {todoStore.todos.map((item) => (
        <div class={styles.todo}>{item.body}</div>
      ))}
    </div>
  );
};

export default Todos;
