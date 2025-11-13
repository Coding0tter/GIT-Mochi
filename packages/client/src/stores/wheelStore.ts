import { createStore } from "solid-js/store";

interface Reviewer {
  id: string;
  avatar_url: string;
  username: string;
  name: string;
}

interface WheelStore {
  isVisible: boolean;
  reviewers: Reviewer[];
  selectedReviewer: string | null;
}

export const [wheelStore, setWheelStore] = createStore<WheelStore>({
  isVisible: false,
  reviewers: [],
  selectedReviewer: null,
});

export const showWheel = (reviewers: Reviewer[]) => {
  setWheelStore({
    isVisible: true,
    reviewers,
    selectedReviewer: null,
  });
};

export const hideWheel = () => {
  setWheelStore("isVisible", false);
};

export const setSelectedReviewer = (reviewerId: string) => {
  setWheelStore("selectedReviewer", reviewerId);
};
