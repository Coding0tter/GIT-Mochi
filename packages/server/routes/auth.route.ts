// routes/auth.ts
import { MochiError } from "@server/errors/mochi.error.ts";
import { RefreshToken } from "@server/models/refresh-token.model.ts";
import { User } from "@server/models/user.model.ts";
import {
  getCookie,
  hashToken,
  issueAndStoreRefreshToken,
  rotateRefreshToken,
  signAccessToken,
  verifyRefreshToken,
} from "@server/utils/auth.ts";
import { logError } from "@server/utils/logger.ts";
import axios from "axios";
import { Router, type Request, type Response } from "express";
import jwt from "jsonwebtoken";

const APP_JWT_SECRET = "dev_access";
const CLIENT_ID =
  "10ab4e1e234836de866c2f15397313d210ff5a358230c54004b371dc3de81978";

const router = Router();

router.post("/gitlab/exchange", async (req: Request, res: Response) => {
  const { access_token, refresh_token, expires_in, created_at } =
    req.body ?? {};

  if (!access_token) {
    res.status(400).json({ error: "missing_access_token" });
    return;
  }

  const r = await fetch("https://git.latido.at/api/v4/user", {
    headers: { Authorization: `Bearer ${access_token}` },
  });

  if (!r.ok) {
    res.status(401).json({ error: "invalid_access_token" });
    return;
  }

  const glUser = await r.json();

  let user = await User.findOne({ gitlabId: glUser.id });
  if (!user) {
    user = await User.create({
      gitlabId: glUser.id,
      username: glUser.username ?? glUser.name ?? `gl_${glUser.id}`,
      email: glUser.email,
      avatarUrl: glUser.avatar_url,
      name: glUser.name,
      gitlabToken: {
        access_token,
        expires_in,
        refresh_token,
        created_at,
      },
    });
  } else {
    user.gitlabToken = {
      access_token,
      expires_in,
      created_at,
      refresh_token,
    };

    await user.save();
  }

  const access = signAccessToken(user);
  await issueAndStoreRefreshToken(user, req, res);

  res.json({ token: access });
});

router.post("/refresh", async (req: Request, res: Response) => {
  const token = getCookie(req, "rt");
  if (!token) {
    res.status(401).json({ error: "missing_refresh_token" });
    return;
  }

  try {
    const payload = verifyRefreshToken(token);
    const { sub: userId, jti } = payload;

    const user = await User.findById(userId);
    if (!user) {
      res.status(401).json({ error: "invalid_user" });
      return;
    }

    const stored = await RefreshToken.findOne({ jti, userId });
    if (
      !stored ||
      stored.revokedAt ||
      (stored.expiresAt && stored.expiresAt < new Date())
    ) {
      await RefreshToken.updateMany(
        { userId },
        { $set: { revokedAt: new Date() } },
      );
      res.clearCookie("rt", { path: "/api" });
      res.status(401).json({ error: "refresh_reuse_detected" });
      return;
    }

    const matches = stored.tokenHash === hashToken(token);
    if (!matches) {
      await RefreshToken.updateMany(
        { userId },
        { $set: { revokedAt: new Date() } },
      );
      res.clearCookie("rt", { path: "/api" });
      res.status(401).json({ error: "token_hash_mismatch" });
      return;
    }

    const access = signAccessToken(user);
    await rotateRefreshToken(jti, user, req, res);

    res.json({ token: access });
  } catch (e) {
    res.clearCookie("rt", { path: "/api/" });
    res.status(401).json({ error: "invalid_or_expired_refresh_token" });
  }
});

router.post("/logout", async (req: Request, res: Response) => {
  const rt = getCookie(req, "rt");
  if (rt) {
    try {
      const { sub: userId, jti } = verifyRefreshToken(rt);
      await RefreshToken.updateOne(
        { userId, jti },
        { $set: { revokedAt: new Date() } },
      );

      const auth = req.headers.authorization || "";
      const m = auth.match(/^Bearer (.+)$/);
      if (!m) {
        logError(new MochiError("no_authorization_header"));
        return;
      }

      const payload = jwt.verify(m[1].replace("Bearer ", ""), APP_JWT_SECRET, {
        issuer: "mochi",
      }) as { sub: string };

      const user = await User.findById(payload.sub);
      if (!user) {
        logError(new MochiError("user_not_found"));
        return;
      }

      const token = user.gitlabToken;

      const REVOKE_URL = "https://git.latido.at/oauth/revoke";

      const form = (token: string, hint: "access_token" | "refresh_token") =>
        new URLSearchParams({
          client_id: CLIENT_ID,
          token,
          token_type_hint: hint,
        });

      await Promise.allSettled([
        axios.post(REVOKE_URL, form(token.access_token, "access_token"), {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        }),
        axios.post(REVOKE_URL, form(token.refresh_token, "refresh_token"), {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        }),
      ]);
    } catch (e) {
      console.log(e);
      logError(
        new MochiError(
          "Invalid rt cookie during logout, still clearing cookie",
        ),
      );
    }
  }

  res.clearCookie("rt", { path: "/api" });
  res.sendStatus(204);
});

export default router;
