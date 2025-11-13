import { mochiClient } from "@client/api/mochi/mochiClient.ts";
import type { GitlabUser } from "shared/types/gitlab/index.ts";

export const getUser = async () => {
  const { data } = await mochiClient.get<GitlabUser>("/safe/user");
  return data;
};

export const searchGitlabUsers = async (search: string) => {
  const { data } = await mochiClient.get<GitlabUser[]>("/user", {
    params: {
      search,
    },
  });

  return data;
};
