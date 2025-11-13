import { MochiError } from "@server/errors/mochi.error.ts";
import { User, type IUser } from "@server/models/user.model.ts";
import { SettingRepo } from "@server/repositories/setting.repo.ts";
import { ContextKeys, setContext } from "@server/utils/asyncContext.ts";
import { logError } from "@server/utils/logger.ts";
import axios from "axios";
import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { SettingKeys } from "shared";

const APP_JWT_SECRET = "dev_access";
const CLIENT_ID =
  "10ab4e1e234836de866c2f15397313d210ff5a358230c54004b371dc3de81978";

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const auth = req.headers.authorization || "";
  const m = auth.match(/^Bearer (.+)$/);
  if (!m) {
    logError(new MochiError("no_authorization_header"));
    res.sendStatus(401);
    return;
  }

  try {
    const payload = jwt.verify(m[1].replace("Bearer ", ""), APP_JWT_SECRET, {
      issuer: "mochi",
    }) as { sub: string };

    const user = await User.findById(payload.sub);
    if (!user) {
      logError(new MochiError("user_not_found"));
      res.sendStatus(401);
      return;
    }

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

          console.log("BEFORE", user.gitlabToken);
          user.gitlabToken = {
            ...data,
          };
          console.log("AFTER", user.gitlabToken);

          await user.save();
        } catch (e) {
          console.log(e);
          logError(new MochiError("failed_to_refresh_token"));
        }
      }
    }

    setContext(ContextKeys.GitlabToken, user.gitlabToken.access_token);
    req.user = user as IUser;
    next();
  } catch (e: unknown) {
    logError(new MochiError("unknown error", 500, e as Error));
    res.sendStatus(401);
  }
};
