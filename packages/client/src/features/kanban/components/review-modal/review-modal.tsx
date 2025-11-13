import type { BaseModalProps } from "@client/components/modals/BaseModal/BaseModal.tsx";
import { BaseModal } from "@client/components/modals/index.ts";
import { submitReview } from "@client/features/kanban/services/review.service.ts";
import {
  clearPoUsers,
  clearReviewers,
  reviewStore,
  searchPoUsers,
  searchReviewerUsers,
} from "@client/features/kanban/stores/review.store.ts";
import type { GitlabUser } from "shared/types/gitlab/user.ts";
import { createSignal, For, onMount, Show } from "solid-js";
import styles from "./review-modal.module.css";
import Button from "@client/components/shared/Button/Button.tsx";
import WheelOfFortune from "@client/components/WheelOfFortune/WheelOfFortune.tsx";
import { getUserSettingByKey } from "@client/shared/services/setting.service.ts";
import { SettingKeys } from "shared";

const ReviewModal = (props: BaseModalProps) => {
  const task = reviewStore.task;
  const [poSearch, setPoSearch] = createSignal<string>(reviewStore.po);
  const [reviewerSearch, setReviewerSearch] = createSignal<string>("");
  const [po, setPo] = createSignal<GitlabUser | undefined>(
    reviewStore.po_users.length === 1 ? reviewStore.po_users[0] : undefined,
  );
  const [reviewers, setReviewers] = createSignal<GitlabUser[]>([]);
  const [defaultReviewers, setDefaultReviewers] = createSignal<GitlabUser[]>(
    [],
  );
  const [isSearchingPo, setIsSearchingPo] = createSignal(false);
  const [isSearchingReviewers, setIsSearchingReviewers] = createSignal(false);
  const [addRandom, setAddRandom] = createSignal(false);

  onMount(async () => {
    setDefaultReviewers(
      await getUserSettingByKey<GitlabUser[]>(SettingKeys.REVIEWERS),
    );
  });

  const handlePoSearch = async (value: string) => {
    setPoSearch(value);
    if (value.length >= 2) {
      setIsSearchingPo(true);
      await searchPoUsers(value);
      setIsSearchingPo(false);
    } else {
      clearPoUsers();
    }
  };

  const handleReviewerSearch = async (value: string) => {
    setReviewerSearch(value);
    if (value.length >= 2) {
      setIsSearchingReviewers(true);
      await searchReviewerUsers(value);
      setIsSearchingReviewers(false);
    } else {
      clearReviewers();
    }
  };

  const selectPo = (user: GitlabUser) => {
    setPo(user);
    setPoSearch(user.username);
    clearPoUsers();
  };

  const toggleReviewer = (user: GitlabUser) => {
    const current = reviewers();
    const exists = current.find((r) => r.id === user.id);

    if (exists) {
      setReviewers(current.filter((r) => r.id !== user.id));
    } else {
      setReviewers([...current, user]);
    }
  };

  const removeReviewer = (userId: number) => {
    setReviewers(reviewers().filter((r) => r.id !== userId));
  };

  const handleSubmit = async () => {
    const selectedPo = po();
    const selectedReviewers = reviewers();

    if (task && selectedPo && selectedReviewers.length > 0) {
      await submitReview(selectedPo, selectedReviewers);
      props.onClose?.();
    }
  };

  const canSubmit = () => po() && reviewers().length > 0;

  return (
    <BaseModal
      disableSubmit={!canSubmit()}
      submitText="Start Review"
      closeText="Cancel"
      onSubmit={handleSubmit}
      {...props}
    >
      <div class={styles.container}>
        <div class={styles.header}>
          <h2>
            <i class="fa-solid fa-clipboard-check"></i> Assign Task for Review
          </h2>
          <div class={styles.taskInfo}>
            <span class={styles.taskTitle}>{task?.title}</span>
          </div>
        </div>

        <div class={styles.content}>
          <div class={styles.section}>
            <h3>
              <i class="fa-solid fa-user-tie"></i> Product Owner
            </h3>
            <div class={styles.searchContainer}>
              <input
                type="text"
                class={styles.searchInput}
                placeholder="Search for PO by name or username..."
                value={poSearch()}
                onInput={(e) => handlePoSearch(e.currentTarget.value)}
              />
              <Show when={isSearchingPo()}>
                <div class={styles.searchIcon}>
                  <i class="fa-solid fa-spinner fa-spin"></i>
                </div>
              </Show>
            </div>

            <Show when={po()}>
              <div class={styles.selectedSection}>
                <span class={styles.selectedLabel}>Selected PO:</span>
                <div class={styles.selectedUser}>
                  <img
                    src={po()!.avatar_url}
                    alt={po()!.name}
                    class={styles.avatar}
                  />
                  <div class={styles.userInfo}>
                    <span class={styles.userName}>{po()!.name}</span>
                    <span class={styles.userUsername}>@{po()!.username}</span>
                  </div>
                  <button
                    class={styles.removeButton}
                    onClick={() => {
                      setPo(undefined);
                      setPoSearch("");
                    }}
                  >
                    <i class="fa-solid fa-xmark"></i>
                  </button>
                </div>
              </div>
            </Show>

            <Show when={reviewStore.po_users.length > 0 && !po()}>
              <div class={styles.userList}>
                <For each={reviewStore.po_users}>
                  {(user) => (
                    <div class={styles.userCard} onClick={() => selectPo(user)}>
                      <img
                        src={user.avatar_url}
                        alt={user.name}
                        class={styles.avatar}
                      />
                      <div class={styles.userInfo}>
                        <span class={styles.userName}>{user.name}</span>
                        <span class={styles.userUsername}>
                          @{user.username}
                        </span>
                      </div>
                    </div>
                  )}
                </For>
              </div>
            </Show>
          </div>

          <div class={styles.section}>
            <h3>
              <i class="fa-solid fa-users"></i> L1 Reviewers
            </h3>
            <div class={styles.searchContainer}>
              <input
                type="text"
                class={styles.searchInput}
                placeholder="Search for reviewers by name or username..."
                value={reviewerSearch()}
                onInput={(e) => handleReviewerSearch(e.currentTarget.value)}
              />
              <Show when={isSearchingReviewers()}>
                <div class={styles.searchIcon}>
                  <i class="fa-solid fa-spinner fa-spin"></i>
                </div>
              </Show>
              <Button
                type="primary"
                onClick={() => {
                  setAddRandom(true);
                }}
              >
                <i class="fa-solid fa-dice"></i>
              </Button>
            </div>

            <Show when={reviewStore.reviewers.length > 0}>
              <div class={styles.userList}>
                <For each={reviewStore.reviewers}>
                  {(user) => {
                    const isSelected = () =>
                      reviewers().some((r) => r.id === user.id);
                    return (
                      <div
                        class={`${styles.userCard} ${isSelected() ? styles.selected : ""}`}
                        onClick={() => toggleReviewer(user)}
                      >
                        <img
                          src={user.avatar_url}
                          alt={user.name}
                          class={styles.avatar}
                        />
                        <div class={styles.userInfo}>
                          <span class={styles.userName}>{user.name}</span>
                          <span class={styles.userUsername}>
                            @{user.username}
                          </span>
                        </div>
                        <Show when={isSelected()}>
                          <i
                            class={`fa-solid fa-check ${styles.checkIcon}`}
                          ></i>
                        </Show>
                      </div>
                    );
                  }}
                </For>
              </div>
            </Show>

            <Show when={reviewers().length > 0}>
              <div class={styles.selectedSection}>
                <span class={styles.selectedLabel}>
                  Selected Reviewers ({reviewers().length}):
                </span>
                <div class={styles.selectedList}>
                  <For each={reviewers()}>
                    {(user) => (
                      <div class={styles.selectedUser}>
                        <img
                          src={user.avatar_url}
                          alt={user.name}
                          class={styles.avatar}
                        />
                        <div class={styles.userInfo}>
                          <span class={styles.userName}>{user.name}</span>
                          <span class={styles.userUsername}>
                            @{user.username}
                          </span>
                        </div>
                        <button
                          class={styles.removeButton}
                          onClick={() => removeReviewer(user.id)}
                        >
                          <i class="fa-solid fa-xmark"></i>
                        </button>
                      </div>
                    )}
                  </For>
                </div>
              </div>
            </Show>
          </div>

          <Show when={!canSubmit()}>
            <div class={styles.hint}>
              <i class="fa-solid fa-info-circle"></i>
              Please select a Product Owner and at least one L1 reviewer to
              start the review process.
            </div>
          </Show>
        </div>
      </div>

      <Show when={addRandom()}>
        <WheelOfFortune
          users={defaultReviewers()}
          onSelect={(user) => {
            toggleReviewer(user);
            setTimeout(() => {
              setAddRandom(false);
            }, 500);
          }}
        />
      </Show>
    </BaseModal>
  );
};

export default ReviewModal;
