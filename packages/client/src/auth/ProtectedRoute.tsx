import { getAccessToken } from "@client/api/auth/index.ts";
import { getUserSettingByKey } from "@client/shared/services/setting.service.ts";
import { fetchCurrentProject } from "@client/shared/stores/project.store.ts";
import { getUser } from "@client/shared/stores/user.store.ts";
import { useLocation, useNavigate } from "@solidjs/router";
import { SettingKeys } from "shared";
import { createSignal, onMount, Show, type ParentComponent } from "solid-js";

const ProtectedRoute: ParentComponent = (props) => {
  const navigate = useNavigate();
  const loc = useLocation();
  const [ready, setReady] = createSignal(false);
  const [authed, setAuthed] = createSignal(false);

  onMount(async () => {
    const ok = !!getAccessToken();
    setAuthed(ok);
    setReady(true);

    if (!ok) {
      navigate("/login", { replace: true, state: { from: loc.pathname } });
    }

    const setup_completed = await getUserSettingByKey(
      SettingKeys.SETUP_COMPLETE,
    );

    if (!setup_completed) {
      navigate("/app/setup");
    }

    await getUser();
    await fetchCurrentProject();
  });

  return (
    <Show when={ready() && authed()} fallback={<div>Loading</div>}>
      {props.children}
    </Show>
  );
};

export default ProtectedRoute;
