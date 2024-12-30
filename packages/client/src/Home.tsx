import { useNavigate } from "@solidjs/router";
import styles from "./Home.module.css";
import logo from "./assets/logo.svg";

const Home = () => {
  const navigator = useNavigate();

  const handleClick = (key: string) => {
    navigator(key);
  };

  return (
    <div class={styles.homeWrapper}>
      <div class={styles.home}>
        <div class={styles.logo}>
          <img src={logo} alt="Git Mochi Logo" />
        </div>

        <div class={styles.homeHeader}>
          <h1>Welcome to Git Mochi</h1>
          <p>Effortlessly manage tasks and track time, all in one place.</p>
        </div>

        <div class={styles.features}>
          <div
            onClick={() => handleClick("/kanban")}
            class={`${styles.featureCard} ${styles.kanban}`}
          >
            <h2>Kanban Board</h2>
            <p>Organize and manage tasks visually.</p>
            <p>
              Press <kbd>Shift+1</kbd> to open the Kanban board.
            </p>
          </div>

          <div
            onClick={() => handleClick("/timetrack")}
            class={`${styles.featureCard} ${styles.timeTracking}`}
          >
            <h2>Time-Tracking Tool</h2>
            <p>Track hours with ease.</p>
            <p>
              Press <kbd>Shift+2</kbd> to open the Time-Tracking tool.
            </p>
          </div>

          <div
            onClick={() => handleClick("/todo")}
            class={`${styles.featureCard} ${styles.todo}`}
          >
            <h2>Todo Tool</h2>
            <p>Manage your todos.</p>
            <p>
              Press <kbd>Shift+3</kbd> to open the Todo tool.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
