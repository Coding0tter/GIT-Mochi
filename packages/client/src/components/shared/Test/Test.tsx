import { logout } from "@client/api/auth/index.ts";
import { getTest, getUser } from "@client/api/mochi/index.ts";
import Button from "@client/components/shared/Button/Button.tsx";
import { createResource, Show, Suspense } from "solid-js";

const Test = () => {
  const [test] = createResource(async () => await getTest());
  const [user] = createResource(async () => await getUser());

  return (
    <div>
      Test Component
      <Suspense>
        <p>
          <Show when={test()} fallback={<div>Unauthorized</div>}>
            {test()?.test}
          </Show>
        </p>

        <p>
          <Show when={test()} fallback={<div>Unauthorized</div>}>
            {user()?.username}
            <img src={user()?.avatar_url} alt="User Avatar" width="50" />
          </Show>
        </p>
      </Suspense>
      <Button onClick={() => logout()}>Logout</Button>
    </div>
  );
};

export default Test;
