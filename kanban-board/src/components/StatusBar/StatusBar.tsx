import { LoadingTarget, uiStore } from "../../stores/uiStore";
import Badge from "../Badge/Badge";
import styles from "./StatusBar.module.css";

const StatusBar = () => {
  return (
    <div class={styles.statusBar}>
      <div class={styles.left}>
        {uiStore.loadingTarget === LoadingTarget.SyncGitlab && (
          <Badge type="none">
            <i class="fa-solid fa-sync"></i> Syncing with Gitlab...
          </Badge>
        )}
        {uiStore.loadingTarget === LoadingTarget.LoadTasks && (
          <Badge type="none">
            <i class="fa-solid fa-trash"></i> Loading tasks...
          </Badge>
        )}
      </div>
      <div class={styles.right}>
        <Badge type="none">
          backend:{" "}
          <strong>
            {uiStore.isConnected ? (
              <i class="fa-solid fa-link"></i>
            ) : (
              <i class="fa-solid fa-link-slash"></i>
            )}
          </strong>
        </Badge>
        <Badge type="none">
          <strong>{uiStore.currentProject?.name || "none"}</strong>
        </Badge>
      </div>
    </div>
  );
};

export default StatusBar;
