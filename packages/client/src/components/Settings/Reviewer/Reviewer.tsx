import { getGitLabUsersAsync } from "@client/services/gitlabService";
import { settingsService } from "@client/services/settingsService";
import { createResource, createSignal, For, Suspense } from "solid-js";
import styles from "./Reviewer.module.css";

type Reviewer = {
  id: string;
};

const ReviewerSettings = () => {
  const [input, setInput] = createSignal("");
  const [reviewerIds, { refetch }] = createResource(
    async (): Promise<string[]> =>
      (await settingsService.getSettingByKey<string[]>("reviewers")) || [],
  );

  const [users] = createResource(async () => {
    return await getGitLabUsersAsync();
  });

  const reviewers = () => {
    const ids = reviewerIds() || [];
    const allUsers = users() || [];
    return ids
      .map((id) => allUsers.find((u: any) => u.id.toString() === id))
      .filter(Boolean);
  };

  const addReviewer = async (user: any) => {
    const currentIds = reviewerIds() || [];
    const userId = user.id.toString();
    if (currentIds.includes(userId)) return;

    await settingsService.updateSetting("reviewers", [...currentIds, userId]);
    refetch();
    setInput("");
  };

  const removeReviewer = async (reviewerId: number) => {
    const currentIds = reviewerIds() || [];
    await settingsService.updateSetting(
      "reviewers",
      currentIds.filter((id) => id !== reviewerId.toString()),
    );

    refetch();
  };

  const filteredUsers = () => {
    const allUsers = users() || [];
    const currentIds = reviewerIds() || [];
    const searchTerm = input().toLowerCase();

    return allUsers.filter(
      (user: any) =>
        user.name.toLowerCase().includes(searchTerm) &&
        !currentIds.includes(user.id.toString()),
    );
  };

  return (
    <div class={styles.container}>
      <label class={styles.label}>Reviewers</label>
      <input
        class={styles.input}
        type="text"
        placeholder="Search users..."
        value={input()}
        onInput={(e) => setInput(e.currentTarget.value)}
      />
      {input() && (
        <div class={styles.availableUsers}>
          <For
            each={filteredUsers()}
            fallback={<div class={styles.noResults}>No users found</div>}
          >
            {(user) => (
              <div onClick={() => addReviewer(user)} class={styles.userRow}>
                {user.name}
              </div>
            )}
          </For>
        </div>
      )}
      <Suspense
        fallback={<div class={styles.loading}>Loading reviewers...</div>}
      >
        <div class={styles.reviewerList}>
          <For
            each={reviewers()}
            fallback={<div class={styles.empty}>No reviewers added</div>}
          >
            {(reviewer) => (
              <div class={styles.reviewerRow}>
                <span>{reviewer.name}</span>
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
