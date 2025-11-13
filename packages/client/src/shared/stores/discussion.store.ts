import { createBaseStore } from "@client/stores/baseStore.ts";
import type { GitlabDiscussion } from "shared/types/gitlab/discussion.ts";
import { getDiscussions as getDiscussionsApi } from "@client/shared/services/discussion.service.ts";
import { orderBy } from "lodash";

interface DiscussionState {
  discussions: GitlabDiscussion[];
}

const {
  store: discussionStore,
  setStore: setDiscussionStore,
  run,
} = createBaseStore<DiscussionState>({
  discussions: [],
});

export { discussionStore };

export const getDiscussions = async (
  issueIid: number,
  mergeRequestIids: number[],
) => {
  await run(
    async () => {
      const discussions = await getDiscussionsApi(issueIid, mergeRequestIids);
      setDiscussionStore({ discussions });

      return discussions;
    },
    {
      showError: true,
    },
  );
};

export const getDiscussionByIid = (iid: number) => {
  const discussions = discussionStore.discussions.filter((discussion) => {
    return discussion.iid === iid;
  });

  return discussions.sort((a, b) => {
    const aTime = a.notes?.[0] ? new Date(a.notes[0].created_at).getTime() : 0;
    const bTime = b.notes?.[0] ? new Date(b.notes[0].created_at).getTime() : 0;

    return bTime - aTime;
  });
};
