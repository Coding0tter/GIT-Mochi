import Button from "@client/components/shared/Button/Button.tsx";
import { useNavigate } from "@solidjs/router";
import { projectStore } from "@client/shared/stores/project.store.ts";
import styles from "./setup-complete.module.css";
import { setUserSettingByKey } from "@client/shared/services/setting.service.ts";
import { SettingKeys } from "shared";

const SetupComplete = () => {
  const nav = useNavigate();

  const handleComplete = () => {
    setUserSettingByKey(SettingKeys.SETUP_COMPLETE, true);
    nav("/app/kanban");
  };

  return (
    <div class={styles.completeStep}>
      <div class={styles.successIcon}>
        <div class={styles.checkmark}>
          <i class="fa-solid fa-check"></i>
        </div>
      </div>

      <h2>You're all set!</h2>
      <p class={styles.subtitle}>
        Mochi is now configured and ready to help you manage your tasks
        efficiently.
      </p>

      <div class={styles.summary}>
        <div class={styles.summaryItem}>
          <div class={styles.summaryIcon}>
            <i class="fa-solid fa-folder"></i>
          </div>
          <div class={styles.summaryContent}>
            <strong>Project</strong>
            <span>{projectStore.project?.name || "Default project"}</span>
          </div>
        </div>

        <div class={styles.summaryItem}>
          <div class={styles.summaryIcon}>
            <i class="fa-solid fa-keyboard"></i>
          </div>
          <div class={styles.summaryContent}>
            <strong>Keyboard Shortcuts</strong>
            <span>Press ? to view available shortcuts</span>
          </div>
        </div>

        <div class={styles.summaryItem}>
          <div class={styles.summaryIcon}>
            <i class="fa-brands fa-gitlab"></i>
          </div>
          <div class={styles.summaryContent}>
            <strong>GitLab Integration</strong>
            <span>Synced and ready</span>
          </div>
        </div>
      </div>

      <Button
        type="primary"
        onClick={handleComplete}
        style={styles.startButton}
      >
        Start Using Mochi
      </Button>
    </div>
  );
};

export default SetupComplete;
