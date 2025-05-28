import { HelpModal } from "@client/components/modals";
import Header from "@client/components/shared/Header/Header";
import NotificationManager from "@client/components/shared/NotificationManager";
import StatusBar from "@client/components/shared/StatusBar/StatusBar";
import { handleKeyDown } from "@client/services/keyboardShortcutHandler";
import { getUserAsync } from "@client/services/userService";
import {
  setSelectedAppointmentForModal,
  modalStore,
  ModalType,
  handleCloseModal,
} from "@client/stores/modalStore";
import {
  fetchRecordingStateAsync,
  fetchTimeTrackEntries,
  timeTrackStore,
} from "@client/stores/timeTrackStore";
import { useNavigate, useLocation } from "@solidjs/router";
import dayjs from "dayjs";
import { onMount, onCleanup, Show } from "solid-js";
import styles from "./App.module.css";

import weekday from "dayjs/plugin/weekday";
import { getGitlabUrl } from "./stores/settings.store";

dayjs.extend(weekday);

const App = (props: any) => {
  const navigator = useNavigate();
  const location = useLocation();
  const keydownHandler = (event: KeyboardEvent) =>
    handleKeyDown(event, navigator, location);

  onMount(async () => {
    if (location.pathname === "/setup") {
      return;
    }

    await getGitlabUrl();
    await fetchRecordingStateAsync();
    await fetchTimeTrackEntries();
    await getUserAsync();
    setSelectedAppointmentForModal(timeTrackStore.entries?.at(0) || null);
    window.addEventListener("keydown", keydownHandler);
  });

  onCleanup(() => {
    window.removeEventListener("keydown", keydownHandler);
  });

  return (
    <div class={styles.app}>
      <Show when={location.pathname !== "/setup"}>
        <div class={styles.container}>
          <Header />
          <NotificationManager />
        </div>
      </Show>
      <div class={styles.content}>{props.children}</div>
      <Show when={location.pathname !== "/setup"}>
        <div class={styles.container}>
          <StatusBar />
        </div>
      </Show>

      {modalStore.activeModals.includes(ModalType.Help) && (
        <HelpModal onClose={handleCloseModal} />
      )}

      {modalStore.activeModals.includes(ModalType.Feedback) && (
        <HelpModal onClose={handleCloseModal} />
      )}
    </div>
  );
};

export default App;
