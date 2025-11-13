import { mochiClient } from "@client/api/mochi/mochiClient.ts";
import type { GitlabLabel } from "shared/types/gitlab/index.ts";

export const searchGitlabLabels = async (search: string, projectId: number) => {
  const { data } = await mochiClient.get<GitlabLabel[]>("/label/gitlab", {
    params: {
      search,
      projectId,
    },
  });

  return data;
};
