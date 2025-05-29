import { resolveThreadAsync } from "@client/services/gitlabService";
import { Direction } from "@client/services/taskNavigationService";
import { discussionStore } from "@client/stores/discussion.store";
import {
  getNavIndex,
  NavigationKeys,
  setNavIndex,
} from "@client/stores/keyboardNavigationStore";
import {
  ModalType,
  openModal,
  setSelectedDiscussionForModal,
} from "@client/stores/modalStore";
import { orderBy } from "lodash";
import { createStore } from "solid-js/store";

interface ModalState {
  isThreadFocused: boolean;
  showSystem: boolean;
  showResolved: boolean;
}

const [state, setState] = createStore<ModalState>({
  isThreadFocused: false,
  showSystem: false,
  showResolved: false,
});

export class TaskDetailsModalService {
  static get isThreadFocused(): boolean {
    return state.isThreadFocused;
  }

  static get showSystem(): boolean {
    return state.showSystem;
  }

  static get showResolved(): boolean {
    return state.showResolved;
  }

  static toggleThreadFocus(): void {
    setState("isThreadFocused", (prev) => !prev);
  }

  static toggleSystemDiscussions(): void {
    setState("showSystem", (prev) => !prev);
  }

  static toggleResolvedDiscussions(): void {
    setState("showResolved", (prev) => !prev);
  }

  static reply() {
    setSelectedDiscussionForModal(
      this.filteredDiscussions().at(getNavIndex(NavigationKeys.Discussion)) ||
        null,
    );
    openModal(ModalType.Reply);
  }

  static resolveThread() {
    resolveThreadAsync(
      this.filteredDiscussions().at(getNavIndex(NavigationKeys.Discussion))!,
    );
  }

  static filteredDiscussions() {
    return orderBy(
      discussionStore.discussions
        ?.filter(
          (discussion) => state.showSystem || !discussion.notes?.[0]?.system,
        )
        ?.filter(
          (discussion) =>
            state.showResolved || !discussion.notes?.[0]?.resolved,
        ) || [],
      (discussion) => {
        const latestNote = orderBy(
          discussion.notes || [],
          "created_at",
          "desc",
        )[0];
        return latestNote?.created_at || 0;
      },
      "desc",
    );
  }

  static moveSelection(direction: Direction) {
    const index = getNavIndex(NavigationKeys.Discussion);
    let newIndex = 0;

    switch (direction) {
      case Direction.Up:
        if (index > 0) {
          newIndex = index - 1;
        } else {
          newIndex = this.filteredDiscussions().length - 1;
        }
        break;
      case Direction.Down:
        if (index < this.filteredDiscussions().length - 1) {
          newIndex = index + 1;
        } else {
          newIndex = 0;
        }
        break;
    }

    setNavIndex(NavigationKeys.Discussion, newIndex);
  }
}
