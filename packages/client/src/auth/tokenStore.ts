export type TokenResponse = {
  access_token: string;
  token_type: "Bearer";
  expires_in: number; // seconds
  refresh_token?: string;
  created_at?: number; // unix seconds (GitLab provides this)
};

const KEY = "gitlab_tokens";

export function saveTokens(t: TokenResponse) {
  localStorage.setItem(KEY, JSON.stringify(t));
}

export function readTokens(): TokenResponse | null {
  const raw = localStorage.getItem(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
export function clearTokens() {
  localStorage.removeItem(KEY);
}

export function isExpired(tokens: TokenResponse, skewSec = 30) {
  const createdAt = tokens.created_at ? tokens.created_at * 1000 : Date.now();
  const expiryMs = createdAt + tokens.expires_in * 1000;
  return Date.now() >= expiryMs - skewSec * 1000;
}
