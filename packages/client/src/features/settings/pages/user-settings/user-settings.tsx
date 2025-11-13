import {
  getUserSettingByKey,
  setUserSettingByKey,
} from "@client/shared/services/setting.service.ts";
import { SettingKeys } from "shared";
import { createSignal, onMount } from "solid-js";
import styles from "./user-settings.module.css";
import { addNotification } from "@client/services/notificationService.ts";
import ReviewerSettings from "../../components/reviewer-settings/reviewer-settings";
import LabelSettings from "../../components/label-settings/label-settings";
import { fetchCurrentProject } from "@client/shared/stores/project.store.ts";

const UserSettings = () => {
  const [gitlabUrl, setGitlabUrl] = createSignal("");
  const [syncLabels, setSyncLabels] = createSignal(false);

  onMount(async () => {
    try {
      const [gitlabUrlValue, syncLabelsValue] = await Promise.all([
        getUserSettingByKey<string>(SettingKeys.GITLAB_URL),
        getUserSettingByKey<boolean>(SettingKeys.SYNC_LABELS),
      ]);

      setGitlabUrl(gitlabUrlValue || "");
      setSyncLabels(syncLabelsValue || false);
    } catch (error) {
      console.error("Failed to load settings:", error);
    }
  });

  return (
    <div class={styles.container}>
      <div class={styles.header}>
        <h1>User Settings</h1>
      </div>

      <div class={styles.form}>
        <div class={styles.generalSettings}>
          <div class={styles.field}>
            <label class={styles.label}>
              <i class="fa-brands fa-gitlab"></i> GitLab URL
            </label>
            <input
              type="text"
              class={styles.input}
              value={gitlabUrl()}
              onInput={(e) => setGitlabUrl(e.currentTarget.value)}
              placeholder="https://gitlab.example.com"
            />
          </div>

          <div class={styles.field}>
            <label class={styles.label}>
              <i class="fa-solid fa-tags"></i> Sync Labels
            </label>
            <div class={styles.toggleContainer}>
              <label class={styles.switch}>
                <input
                  type="checkbox"
                  checked={syncLabels()}
                  onChange={async (e) => {
                    try {
                      await setUserSettingByKey(
                        SettingKeys.SYNC_LABELS,
                        e.currentTarget.checked,
                      );

                      addNotification({
                        type: "success",
                        title: "Success",
                        description: "Sync Labels setting updated.",
                      });
                    } catch (error) {
                      addNotification({
                        type: "error",
                        title: "Error",
                        description: "Failed to update Sync Labels setting.",
                      });
                    }
                  }}
                />
                <span class={styles.slider}></span>
              </label>
              <span class={styles.toggleLabel}>
                {syncLabels() ? "Enabled" : "Disabled"}
              </span>
            </div>
          </div>
        </div>

        <div class={styles.section}>
          <h2 class={styles.sectionTitle}>
            <i class="fa-solid fa-code-pull-request"></i> Reviewers
          </h2>
          <ReviewerSettings />
        </div>

        <div class={styles.section}>
          <h2 class={styles.sectionTitle}>
            <i class="fa-solid fa-tags"></i> Kanban Labels
          </h2>
          <p class={styles.sectionDescription}>
            Assign Gitlab labels to columns to automatically set labels when
            card is moved to it. Also new entries will be moved to column if
            possible.
          </p>
          <LabelSettings />
        </div>
      </div>
    </div>
  );
};

export default UserSettings;
