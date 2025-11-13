import { addNotification } from "@client/services/notificationService.ts";
import {
  getUserSettingByKey,
  setUserSettingByKey,
} from "@client/shared/services/setting.service.ts";
import { createBaseStore } from "@client/stores/baseStore.ts";
import { SettingKeys } from "shared";
import type { GitlabUser } from "shared/types/gitlab/user.ts";

interface ReviewerState {
  reviewers: GitlabUser[];
}

const {
  store: reviewerStore,
  setStore: setReviewerStore,
  run,
} = createBaseStore<ReviewerState>({
  reviewers: [],
});

export { reviewerStore };

export const fetchReviewers = async () => {
  await run(async () => {
    const reviewers = await getUserSettingByKey(SettingKeys.REVIEWERS);
    setReviewerStore({ reviewers: (reviewers as GitlabUser[]) || [] });
  });
};

export const addReviewer = (reviewer: GitlabUser) => {
  const { reviewers } = reviewerStore;
  setReviewerStore({ reviewers: [...reviewers, reviewer] });
  saveReviewers(`Reviewer "${reviewer.name}" added successfully.`);
};

export const removeReviewer = (reviewerId: number) => {
  const { reviewers } = reviewerStore;
  setReviewerStore({
    reviewers: reviewers.filter((r) => r.id !== reviewerId),
  });

  saveReviewers(`Reviewer removed successfully.`);
};

const saveReviewers = async (message: string) => {
  await run(
    async () => {
      await setUserSettingByKey(SettingKeys.REVIEWERS, reviewerStore.reviewers);
      addNotification({
        type: "success",
        title: "Success",
        description: message,
      });
    },
    {
      showError: true,
    },
  );
};
