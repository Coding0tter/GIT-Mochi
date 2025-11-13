import axios from "axios";
import { randomString, sha256 } from "./pkce";

const GITLAB_BASE = "https://git.latido.at";
const CLIENT_ID =
  "10ab4e1e234836de866c2f15397313d210ff5a358230c54004b371dc3de81978";
const REDIRECT_URI = "http://localhost:3005/auth/callback";
const SCOPES = ["read_user", "api"].join(" ");

export async function startLogin() {
  const state = randomString(16);
  const verifier = randomString(64);
  const challenge = await sha256(verifier);

  sessionStorage.setItem("oauth_state", state);
  sessionStorage.setItem("pkce_verifier", verifier);

  const u = new URL(`${GITLAB_BASE}/oauth/authorize`);
  u.searchParams.set("client_id", CLIENT_ID);
  u.searchParams.set("redirect_uri", REDIRECT_URI);
  u.searchParams.set("response_type", "code");
  u.searchParams.set("scope", SCOPES);
  u.searchParams.set("state", state);
  u.searchParams.set("code_challenge", challenge);
  u.searchParams.set("code_challenge_method", "S256");

  window.location.href = u.toString();
}

export async function handleCallback() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code");
  const state = params.get("state");
  const expected = sessionStorage.getItem("oauth_state");
  const verifier = sessionStorage.getItem("pkce_verifier");
  if (!code || !state || state !== expected || !verifier) {
    throw new Error("OAuth state mismatch / missing verifier");
  }

  const body = new URLSearchParams();
  body.set("grant_type", "authorization_code");
  body.set("client_id", CLIENT_ID);
  body.set("code", code);
  body.set("redirect_uri", REDIRECT_URI);
  body.set("code_verifier", verifier);

  const { data } = await axios.post(`${GITLAB_BASE}/oauth/token`, body, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  sessionStorage.removeItem("oauth_state");
  sessionStorage.removeItem("pkce_verifier");

  // clean query
  window.history.replaceState({}, "", new URL(REDIRECT_URI).pathname);

  return data;
}
