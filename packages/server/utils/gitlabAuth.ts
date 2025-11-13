import { MochiError } from "@server/errors/mochi.error.ts";
import type { IUser } from "@server/models/user.model.ts";
import { SettingRepo } from "@server/repositories/setting.repo.ts";
import { logError } from "@server/utils/logger.ts";
import axios from "axios";
import { SettingKeys } from "shared/enums/index.ts";

const CLIENT_ID =
  "10ab4e1e234836de866c2f15397313d210ff5a358230c54004b371dc3de81978";

export const checkGitlabToken = async (user: IUser) => {
  const token = user.gitlabToken;

  if (token.created_at && token.expires_in) {
    const expiresAt = token.created_at + token.expires_in;
    const now = Math.floor(Date.now() / 1000);
    if (now >= expiresAt) {
      try {
        const settingsRepo = new SettingRepo();

        const git_url = (
          await settingsRepo.getByKeyAsync(SettingKeys.GITLAB_URL)
        )?.value;

        const { data } = await axios.post(`${git_url}/oauth/token`, null, {
          params: {
            client_id: CLIENT_ID,
            refresh_token: token.refresh_token,
            grant_type: "refresh_token",
            redirect_uri: "http://localhost:3005/auth/callback",
          },
        });

        user.gitlabToken = {
          ...data,
        };

        await user.save();
      } catch (e) {
        console.log(e);
        logError(new MochiError("failed_to_refresh_token"));
      }
    }
  }
};
