import { startLogin } from "@client/auth/oauth.ts";

export default function Login() {
  return (
    <div style="padding:16px">
      <button onClick={() => startLogin()}>Login with GitLab</button>
    </div>
  );
}
