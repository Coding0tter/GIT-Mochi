import { useLocation, useNavigate } from "@solidjs/router";
import dayjs from "dayjs";
import weekday from "dayjs/plugin/weekday";
import { onCleanup, onMount } from "solid-js";
import styles from "./App.module.css";
import { HelpModal } from "./components/modals";
import Header from "./components/shared/Header/Header";
import NotificationManager from "./components/shared/NotificationManager";
import StatusBar from "./components/shared/StatusBar/StatusBar";
import { handleKeyDown } from "./services/keyboardShortcutHandler";
import { handleCloseModal, modalStore, ModalType, setSelectedAppointmentForModal } from "./stores/modalStore";
import {
  fetchRecordingStateAsync,
  fetchTimeTrackEntries,
  timeTrackStore,
} from "./stores/timeTrackStore";

dayjs.extend(weekday);

const App = (props: any) => {
  const navigator = useNavigate();
  const location = useLocation();
  const keydownHandler = (event: KeyboardEvent) =>
    handleKeyDown(event, navigator, location);

  onMount(async () => {
    await fetchRecordingStateAsync();
    await fetchTimeTrackEntries();
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
