import jwt from "jsonwebtoken";
import type { Response, Request } from "express";
import crypto from "crypto";
import { RefreshToken } from "@server/models/refresh-token.model.ts";
import type { IUser } from "@server/models/user.model.ts";

const {
  JWT_ACCESS_SECRET = "dev_access",
  JWT_REFRESH_SECRET = "dev_refresh",
  JWT_ISSUER = "mochi",
  NODE_ENV,
} = process.env;

const isProd = NODE_ENV === "production";

export function getCookie(req: Request, name: string): string | null {
  const raw = req.headers.cookie ?? "";
  // cookie header: "a=1; rt=JWT.HERE; other=x"
  for (const part of raw.split(";")) {
    const [k, ...rest] = part.trim().split("=");
    if (k === name) return decodeURIComponent(rest.join("="));
  }
  return null;
}

export function signAccessToken(user: IUser) {
  return jwt.sign(
    { sub: user.id, uname: user.username, provider: "gitlab" },
    JWT_ACCESS_SECRET,
    { expiresIn: "15m", issuer: JWT_ISSUER },
  );
}

export function signRefreshToken(payload: { sub: string; jti: string }) {
  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: "30d",
    issuer: JWT_ISSUER,
  });
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, JWT_REFRESH_SECRET) as {
    sub: string;
    jti: string;
    iat: number;
    exp: number;
  };
}

export function setRefreshCookie(res: Response, token: string) {
  res.cookie("rt", token, {
    httpOnly: true,
    secure: isProd, // true in production
    sameSite: "lax",
    path: "/api", // leading slash!
    // consider: domain: ".your-domain.tld"
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30d
  });
}

// hash RT before storing to DB (prevents DB leak -> token leak)
export function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

// Persist & rotate
export async function issueAndStoreRefreshToken(
  user: IUser,
  req: Request,
  res: Response,
) {
  const jti = crypto.randomUUID();
  const rt = signRefreshToken({ sub: user.id, jti });

  await RefreshToken.create({
    userId: user.id,
    jti,
    tokenHash: hashToken(rt),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    userAgent: req.headers["user-agent"] ?? "",
    ip: req.ip,
  });

  setRefreshCookie(res, rt);
  return rt;
}

// rotate (revoke old, issue new)
export async function rotateRefreshToken(
  oldJti: string,
  user: IUser,
  req: Request,
  res: Response,
) {
  await RefreshToken.updateOne(
    { jti: oldJti, userId: user.id },
    { $set: { revokedAt: new Date() } },
  );
  return issueAndStoreRefreshToken(user, req, res);
}
