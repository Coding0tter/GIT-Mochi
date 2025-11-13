import { HelpModal } from "@client/components/modals";
import Header from "@client/components/shared/Header/Header";
import NotificationManager from "@client/components/shared/NotificationManager";
import StatusBar from "@client/components/shared/StatusBar/StatusBar";
import { handleKeyDown } from "@client/services/keyboardShortcutHandler";
import { getUserAsync } from "@client/services/userService";
import {
  handleCloseModal,
  setSelectedAppointmentForModal,
} from "@client/stores/modalStore";
import {
  fetchRecordingStateAsync,
  fetchTimeTrackEntries,
  timeTrackStore,
} from "@client/stores/timeTrackStore";
import { setSelectedReviewer, wheelStore } from "@client/stores/wheelStore";
import { useLocation, useNavigate } from "@solidjs/router";
import dayjs from "dayjs";
import { createEffect, createSignal, onCleanup, onMount, Show } from "solid-js";
import styles from "./App.module.css";

import weekday from "dayjs/plugin/weekday";
import witchImage from "./assets/witch.png";
import { getGitlabUrl } from "./stores/settings.store";
import { modalStore, ModalType } from "@client/shared/stores/modal.store.ts";

dayjs.extend(weekday);

const App = (props: any) => {
  const navigator = useNavigate();
  const location = useLocation();
  const keydownHandler = (event: KeyboardEvent) =>
    handleKeyDown(event, navigator, location);

  const [isHalloween, setIsHalloween] = createSignal(false);
  const [witchFlying, setWitchFlying] = createSignal(false);
  const [witchPath, setWitchPath] = createSignal("");

  const startWitchFlight = () => {
    const amplitude = 100 + Math.random() * 150; // Random amplitude between 100-250px
    const phase = Math.random() * Math.PI * 2; // Random starting phase
    const offset = 20 + Math.random() * 40; // Random vertical offset percentage

    // Create keyframes with smooth sine wave path
    const animationName = `witchFly${Date.now()}`;
    let keyframes = `@keyframes ${animationName} { `;
    let prevY = offset;

    for (let i = 0; i <= 100; i += 2) {
      const x = -10 + (i / 100) * 120; // Start at -10vw, end at 110vw
      const y =
        offset +
        Math.sin((i / 100) * Math.PI * 4 + phase) *
          ((amplitude / window.innerHeight) * 100);

      // Calculate rotation based on vertical movement direction
      const deltaY = y - prevY;
      const rotation = Math.max(-25, Math.min(25, deltaY * 3)); // Clamp rotation between -25 and 25 degrees

      keyframes += `${i}% { left: ${x}vw; top: ${y}vh; transform: translateX(-50%) translateY(-50%) rotate(${rotation}deg); } `;
      prevY = y;
    }
    keyframes += "}";

    setWitchPath(
      keyframes +
        ` .witch-active { animation: ${animationName} 15s linear forwards !important; }`,
    );
    setWitchFlying(true);

    // Remove witch after animation completes
    setTimeout(() => {
      setWitchFlying(false);
    }, 15000); // 15 second flight duration
  };

  const scheduleNextWitch = () => {
    // Random interval between 20-60 seconds
    const delay = 20000 + Math.random() * 40000;
    setTimeout(() => {
      if (isHalloween()) {
        startWitchFlight();
        scheduleNextWitch();
      }
    }, delay);
  };

  onMount(async () => {
    if (location.pathname === "/setup") {
      return;
    }

    setIsHalloween(dayjs().month() === 9 && dayjs().date() > 20);

    await getGitlabUrl();
    await fetchRecordingStateAsync();
    await fetchTimeTrackEntries();
    await getUserAsync();
    setSelectedAppointmentForModal(timeTrackStore.entries?.at(0) || null);
    window.addEventListener("keydown", keydownHandler);
  });

  createEffect(() => {
    if (isHalloween()) {
      scheduleNextWitch();
    }
  });

  onCleanup(() => {
    window.removeEventListener("keydown", keydownHandler);
  });

  return (
    <div class={styles.app} classList={{ [styles.halloween]: isHalloween() }}>
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

      <Show when={isHalloween() && witchFlying()}>
        <style>{witchPath()}</style>
        <img
          src={witchImage}
          class={`${styles.witch} witch-active`}
          alt="Flying witch"
        />
      </Show>
    </div>
  );
};

export default App;
