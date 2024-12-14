import type { IDiscussion } from "../types/task";

export const discussionsEqual = (
  oldDiscussions: IDiscussion[],
  newDiscussions: IDiscussion[]
): boolean => {
  if (oldDiscussions.length !== newDiscussions.length) {
    return false;
  }

  for (let i = 0; i < oldDiscussions.length; i++) {
    const oldNotes = oldDiscussions[i].notes;
    const newNotes = newDiscussions[i].notes;

    if (oldNotes === undefined || newNotes === undefined) {
      return false;
    }

    if (oldNotes.length !== newNotes.length) {
      return false;
    }

    for (let j = 0; j < (oldNotes.length || 0); j++) {
      if (oldNotes.at(j)?.body !== newNotes.at(j)?.body) {
        return false;
      }

      if (oldNotes.at(j)?.resolved !== newNotes.at(j)?.resolved) {
        return false;
      }
    }
  }

  return true;
};
