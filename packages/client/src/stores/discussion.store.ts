import axios from "axios";
import type { IDiscussion } from "shared/types/task";
import { createStore } from "solid-js/store";
import { LoadingTarget, setLoading, uiStore } from "./uiStore";

interface DiscussionStore {
  discussions: IDiscussion[];
}

export const [discussionStore, setDiscussionStore] =
  createStore<DiscussionStore>({
    discussions: [],
  });

export const fetchDiscussions = async (id: number, type: string) => {
  setLoading(LoadingTarget.LoadDiscussions);
  const res = await axios.get(`/tasks/discussions?id=${id}&type=${type}`);

  setDiscussionStore("discussions", res.data);
  setLoading(LoadingTarget.None);
};
