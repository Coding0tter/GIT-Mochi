import { loginWithGitLab } from "@client/api/auth/index.ts";
import { handleCallback } from "@client/auth/oauth.ts";
import { useNavigate } from "@solidjs/router";
import { onMount } from "solid-js";

export default function Callback() {
  const nav = useNavigate();
  onMount(async () => {
    const token = await handleCallback();

    if (!token?.access_token) {
      return nav("/login", { replace: true });
    }

    await loginWithGitLab(token);

    nav("/app/kanban", { replace: true });
  });
  return <div>Signing you in…</div>;
}
