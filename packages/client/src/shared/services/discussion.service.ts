import { mochiClient } from "@client/api/mochi/mochiClient.ts";

export const getDiscussions = async (
  issueIid: number,
  mergeRequestIids: number[],
) => {
  const { data } = await mochiClient.get("/discussion", {
    params: {
      issueIid,
      mergeRequestIids,
    },
  });

  return data;
};
