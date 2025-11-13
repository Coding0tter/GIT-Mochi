import { mochiClient } from "@client/api/mochi/mochiClient.ts";
import { reviewStore } from "@client/features/kanban/stores/review.store.ts";
import type { GitlabUser } from "shared/types/gitlab/index.ts";

export const submitReview = async (po: GitlabUser, reviewers: GitlabUser[]) => {
  const mrIid = reviewStore.mrIid;

  await mochiClient.post(`/gitlab/reviewers/${mrIid}`, {
    userIds: [po, ...reviewers].flat().map((u) => u.id),
  });
};
