import { uiStore } from "../../stores/uiStore";
import Badge from "../Badge/Badge";
import styles from "./StatusBar.module.css";

const StatusBar = () => {
  return (
    <div class={styles.statusBar}>
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
  );
};

export default StatusBar;
