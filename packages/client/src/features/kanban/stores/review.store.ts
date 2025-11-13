import { searchGitlabUsers } from "@client/shared/stores/user.store.ts";
import { createBaseStore } from "@client/stores/baseStore.ts";
import type { GitlabUser } from "shared/types/gitlab/index.ts";
import type { ITaskV2 } from "shared/types/task.v2.ts";

interface ReviewState {
  task: ITaskV2 | null;
  mrIid: number | null;
  po: string;
  po_users: GitlabUser[];
  reviewers: GitlabUser[];
}

const { store: reviewStore, setStore: setReviewStore } =
  createBaseStore<ReviewState>({
    task: null,
    mrIid: null,
    po: "",
    po_users: [],
    reviewers: [],
  });

export { reviewStore };

export const startReview = async (task: ITaskV2, mrIid: number) => {
  const po = task.labels.find((label) => label.startsWith("po:"));

  const po_users = await searchGitlabUsers(po ? po.replace("po::", "") : "");

  setReviewStore({
    task,
    mrIid,
    po: po || "",
    po_users: po_users ?? [],
  });
};

export const searchPoUsers = async (search: string) => {
  const users = await searchGitlabUsers(search);
  setReviewStore({ po_users: users ?? [] });
};

export const searchReviewerUsers = async (search: string) => {
  const users = await searchGitlabUsers(search);
  setReviewStore({ reviewers: users ?? [] });
};

export const clearPoUsers = () => {
  setReviewStore({ po_users: [] });
};

export const clearReviewers = () => {
  setReviewStore({ reviewers: [] });
};
