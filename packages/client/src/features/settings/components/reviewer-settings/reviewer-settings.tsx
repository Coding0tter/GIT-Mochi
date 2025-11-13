import {
  addReviewer,
  fetchReviewers,
  removeReviewer,
  reviewerStore,
} from "@client/shared/stores/reviewer.store.ts";
import {
  searchGitlabUsers,
  userStore,
} from "@client/shared/stores/user.store.ts";
import { debounce } from "lodash";
import { onMount, Show } from "solid-js";
import { For, Suspense } from "solid-js/web";
import styles from "./reviewer-settings.module.css";

const ReviewerSettings = () => {
  onMount(fetchReviewers);

  return (
    <div class={styles.container}>
      <h2 class={styles.subheading}>Reviewers</h2>
      <input
        class={styles.input}
        type="text"
        placeholder="Search users..."
        onInput={(e) =>
          debounce(() => searchGitlabUsers(e.target.value), 300)()
        }
      />
      <Show when={userStore.users.length}>
        <div class={styles.availableUsers}>
          <For
            each={userStore.users}
            fallback={<div class={styles.noResults}>No users found</div>}
          >
            {(user) => (
              <div class={styles.userCard} onClick={() => addReviewer(user)}>
                <img
                  src={
                    user?.avatar_url ||
                    `https://avatar.vercel.sh/${user?.username}`
                  }
                  alt="User avatar"
                  class={styles.userAvatar}
                />
                <div class={styles.userInfo}>
                  <h3>{user?.name}</h3>
                </div>
              </div>
            )}
          </For>
        </div>
      </Show>
      <Suspense
        fallback={<div class={styles.loading}>Loading reviewers...</div>}
      >
        <h2 class={styles.subheading}>Selected Reviewers</h2>
        <div class={styles.reviewerList}>
          <For
            each={reviewerStore.reviewers}
            fallback={<div class={styles.empty}>No reviewers added</div>}
          >
            {(reviewer) => (
              <div class={styles.userCard}>
                <img
                  src={
                    reviewer?.avatar_url ||
                    `https://avatar.vercel.sh/${reviewer?.username}`
                  }
                  alt="User avatar"
                  class={styles.userAvatar}
                />
                <div class={styles.userInfo}>
                  <h3>{reviewer?.name}</h3>
                </div>
                <button
                  class={styles.removeBtn}
                  onClick={() => removeReviewer(reviewer.id)}
                >
                  ×
                </button>
              </div>
            )}
          </For>
        </div>
      </Suspense>
    </div>
  );
};

export default ReviewerSettings;
