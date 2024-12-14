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
import { onMount, onCleanup } from "solid-js";
import styles from "./App.module.css";

import weekday from "dayjs/plugin/weekday";

dayjs.extend(weekday);

const App = (props: any) => {
  const navigator = useNavigate();
  const location = useLocation();
  const keydownHandler = (event: KeyboardEvent) =>
    handleKeyDown(event, navigator, location);

  onMount(async () => {
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
      <div class={styles.container}>
        <Header />
        <NotificationManager />
      </div>
      <div class={styles.content}>{props.children}</div>
      <div class={styles.container}>
        <StatusBar />
      </div>
      {modalStore.activeModal === ModalType.Help && (
        <HelpModal onClose={handleCloseModal} />
      )}
    </div>
  );
};

export default App;
