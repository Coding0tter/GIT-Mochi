import { mochiClient } from "@client/api/mochi/mochiClient.ts";
import axios from "axios";

let accessToken: string | null = null;
let bootstrapped = false;

export function getAccessToken() {
  return accessToken;
}

export async function bootstrapSession() {
  if (bootstrapped) return;
  bootstrapped = true;
  try {
    await refresh();
  } catch {
    accessToken = null;
  }
}

export async function loginWithGitLab(gitlabToken: any) {
  const r = await axios.post(
    `/auth/gitlab/exchange`,
    { ...gitlabToken },
    {
      withCredentials: true,
    },
  );

  if (r.status !== 200) throw new Error("exchange_failed");
  const { token } = await r.data;
  accessToken = token;
}

export async function refresh() {
  const { status, data } = await axios.post(`/auth/refresh`, null, {
    withCredentials: true,
  });
  if (status !== 200) throw new Error("refresh_failed");
  const { token } = data;
  accessToken = token;
  return token;
}

export async function logout() {
  await mochiClient.post("/auth/logout", null, {
    withCredentials: true,
  });

  window.location.href = "/login";
}
