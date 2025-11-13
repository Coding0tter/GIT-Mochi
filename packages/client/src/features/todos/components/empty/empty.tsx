import styles from "./empty.module.css";

const TodoEmpty = () => {
  return (
    <div class={styles.emptyState}>
      <div class={styles.emptyIcon}>✨</div>
      <h3>All clear!</h3>
      <p>You have no pending todos.</p>
    </div>
  );
};

export default TodoEmpty;
