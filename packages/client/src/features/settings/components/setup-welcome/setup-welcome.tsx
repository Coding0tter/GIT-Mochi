import Button from "@client/components/shared/Button/Button.tsx";
import styles from "./setup-welcome.module.css";
import {
  nextStep,
  SetupStep,
} from "@client/features/settings/stores/setup.store.ts";
import { createResource, Show } from "solid-js";
import { getUser } from "@client/api/mochi/index.ts";

const SetupWelcome = () => {
  const [user] = createResource(async () => await getUser());

  return (
    <div class={styles.welcomeStep}>
      <h2>Let's get you started</h2>
      <p>
        Mochi is a keyboard-friendly, GitLab-integrated Kanban board that makes
        task management efficient and intuitive.
      </p>
      <div class={styles.features}>
        <div class={styles.feature}>
          <i class="fa-solid fa-keyboard"></i>
          <span>Vim-motions keyboard shortcuts</span>
        </div>
        <div class={styles.feature}>
          <i class="fa-brands fa-gitlab"></i>
          <span>GitLab integration</span>
        </div>
      </div>

      <div class={styles.userCard}>
        <Show when={user()} fallback={<p>Loading user info...</p>}>
          <img
            src={
              user()?.avatar_url ||
              `https://avatar.vercel.sh/${user()?.username}`
            }
            alt="User avatar"
            class={styles.userAvatar}
          />
          <div class={styles.userInfo}>
            <h3>Hello {user()?.name}</h3>
            <p>@{user()?.username}</p>
            <p>{user()?.email}</p>
          </div>
        </Show>
      </div>

      <Button type="primary" onClick={() => nextStep()}>
        Get Started
      </Button>
    </div>
  );
};

export default SetupWelcome;
