import { mochiClient } from "@client/api/mochi/mochiClient.ts";
import type { GitlabProject } from "shared/types/gitlab/project.ts";

export const searchGitlabProjects = async (search: string) => {
  const { data } = await mochiClient.get<GitlabProject[]>("/project", {
    params: {
      search,
    },
  });

  return data;
};
