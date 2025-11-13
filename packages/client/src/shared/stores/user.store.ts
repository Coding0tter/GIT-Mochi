import { createBaseStore } from "@client/stores/baseStore.ts";
import { LoadingTarget } from "@client/stores/uiStore.ts";
import type { GitlabUser } from "shared/types/gitlab/index.ts";
import {
  searchGitlabUsers as searchGitlabUsersApi,
  getUser as getUserApi,
} from "@client/shared/services/user.service.ts";

interface UserState {
  users: GitlabUser[];
  user?: GitlabUser;
}

const {
  store: userStore,
  setStore: setUserStore,
  run,
} = createBaseStore<UserState>({
  users: [],
});

export { userStore };

export const getUser = async () => {
  await run(
    async () => {
      const user = await getUserApi();
      setUserStore({ user });
      return user;
    },
    {
      showError: true,
    },
  );
};

export const searchGitlabUsers = async (search: string) => {
  return await run(
    async () => {
      const users = await searchGitlabUsersApi(search);
      setUserStore({ users });
      return users;
    },
    {
      action: "fetchUsers",
      loadingTarget: LoadingTarget.Users,
    },
  );
};
