import { useNavigate } from "@solidjs/router";
import { onCleanup, onMount } from "solid-js";
import { HelpModal } from "./components/modals";
import NotificationManager from "./components/shared/NotificationManager";
import StatusBar from "./components/Kanban/StatusBar/StatusBar";
import { handleKeyDown } from "./services/keyboardShortcutHandler";
import { handleCloseModal, modalStore, ModalType } from "./stores/modalStore";
import Header from "./components/shared/Header/Header";
import styles from "./App.module.css";

const App = (props: any) => {
  const navigator = useNavigate();
  const keydownHandler = (event: KeyboardEvent) =>
    handleKeyDown(event, navigator);

  onMount(async () => {
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
