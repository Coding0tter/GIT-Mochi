import axios from "axios";
import { BACKEND_URL } from "@client/constants.ts";
import {
  bootstrapSession,
  getAccessToken,
  logout,
  refresh,
} from "@client/api/auth/index.ts";

export const mochiClient = axios.create({
  baseURL: BACKEND_URL + "/api",
  withCredentials: true,
});

let refreshing: Promise<string | void> | null = null;
let bootPromise: Promise<void> | null = null;

export function initApi() {
  if (!bootPromise) {
    bootPromise = bootstrapSession().finally(() => (bootPromise = null));
  }
  return bootPromise;
}

mochiClient.interceptors.request.use(async (config) => {
  if (bootPromise) await bootPromise;

  const at = getAccessToken();

  if (at) {
    config.headers = config.headers || {};
    config.headers["Authorization"] = `Bearer ${at}`;
  }

  return config;
});

mochiClient.interceptors.response.use(
  (r) => r,
  async (err) => {
    const status = err?.response?.status;
    const original = err.config;
    if (status === 401 && !original?._retry) {
      original._retry = true;
      try {
        refreshing = refreshing ?? refresh();
        await refreshing;
        refreshing = null;

        const at = getAccessToken();
        original.headers = original.headers ?? {};
        if (at) original.headers.Authorization = `Bearer ${at}`;
        return mochiClient(original);
      } catch {
        refreshing = null;
        logout();
      }
    }
    return Promise.reject(err);
  },
);
