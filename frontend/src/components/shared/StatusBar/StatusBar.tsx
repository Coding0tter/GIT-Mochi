import { createEffect, createSignal, onCleanup } from "solid-js";
import { timeTrackStore } from "../../../stores/timeTrackStore";
import { CalendarMode, LoadingTarget, uiStore } from "../../../stores/uiStore";
import Badge from "../Badge/Badge";
import styles from "./StatusBar.module.css";
import { useLocation } from "@solidjs/router";

const StatusBar = () => {
  const location = useLocation();
  const [trackedDuration, setTrackedDuration] = createSignal<string | null>(
    null
  );
  const [isCalendar, setIsCalendar] = createSignal(false);

  createEffect(() => {
    setIsCalendar(location.pathname === "/timetrack");
  }, [location]);

  createEffect(() => {
    let timer = null;
    if (timeTrackStore.recording) {
      const updateDuration = () => {
        const lastEntry = timeTrackStore.entries.at(-1);
        if (lastEntry) {
          const diff =
            new Date().getTime() - new Date(lastEntry.start).getTime();
          const minutes = Math.floor(diff / 1000 / 60);
          const hours = Math.floor(minutes / 60);

          const remainingMinutes = minutes - hours * 60;

          setTrackedDuration(`${hours}h ${remainingMinutes}m`);
        }
      };

      updateDuration();
      timer = setInterval(updateDuration, 60000);
    } else {
      setTrackedDuration(null);
    }

    onCleanup(() => {
      if (timer) {
        clearInterval(timer);
      }
    });
  }, [timeTrackStore.entries, timeTrackStore.recording]);

  return (
    <div class={styles.statusBar}>
      <div class={styles.left}>
        {isCalendar() && (
          <div class={`${styles.calendarMode} ${styles[uiStore.calendarMode]}`}>
            {uiStore.calendarMode === CalendarMode.Time && "Time"}
            {uiStore.calendarMode === CalendarMode.Appointment && "Appointment"}
          </div>
        )}
        {uiStore.loadingTarget === LoadingTarget.SyncGitlab && (
          <Badge type="none">
            <i class="fa-solid fa-sync"></i> Syncing with Gitlab...
          </Badge>
        )}
        {uiStore.loadingTarget === LoadingTarget.LoadTasks && (
          <Badge type="none">
            <i class="fa-solid fa-trash"></i> Loading tasks...
          </Badge>
        )}
      </div>
      <div class={styles.right}>
        {trackedDuration() && <Badge type="low">{trackedDuration()}</Badge>}
        <Badge type="none">
          backend:{" "}
          <strong>
            {uiStore.isConnected ? (
              <i class="fa-solid fa-link"></i>
            ) : (
              <i class="fa-solid fa-link-slash"></i>
            )}
          </strong>
        </Badge>
        <Badge type="none">
          <strong>{uiStore.currentProject?.name || "none"}</strong>
        </Badge>
      </div>
    </div>
  );
};

export default StatusBar;
