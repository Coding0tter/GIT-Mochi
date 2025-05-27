import styles from "./Loading.module.css";

const Loading = () => {
  return (
    <div class={styles.loading}>
      <div class={styles.dots}>
        <div class={styles.dot}></div>
        <div class={styles.dot}></div>
        <div class={styles.dot}></div>
      </div>
    </div>
  );
};

export default Loading;
