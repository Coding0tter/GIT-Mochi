import { Dayjs } from "dayjs";
import { createSignal, onMount, onCleanup, createEffect } from "solid-js";
import styles from "./Appointment.module.css";
import { CalendarMode, uiStore } from "../../../stores/uiStore";
import { timeTrackStore } from "../../../stores/timeTrackStore";
import { keyboardNavigationStore } from "../../../stores/keyboardNavigationStore";

const Appointment = ({
  length,
  title,
  start,
  index,
}: {
  length: number;
  title: string;
  start: Dayjs;
  index: number;
}) => {
  const [minuteHeight, setMinuteHeight] = createSignal<number>(0);

  const calculateMinuteHeight = () => {
    const quarterElement = document.getElementById("day-0-hour-8-quarter-0");

    if (quarterElement) {
      const quarterHeight = quarterElement.getBoundingClientRect().height;
      setMinuteHeight(quarterHeight / 15); // Each quarter has 15 minutes
    }
  };

  onMount(() => {
    calculateMinuteHeight();

    // Recalculate minute height on resize
    window.addEventListener("resize", calculateMinuteHeight);

    return () => {
      window.removeEventListener("resize", calculateMinuteHeight);
    };
  });

  const getMarginTop = () => {
    const calendarStartHour = 8; // The start hour of your calendar
    const startHour = start.hour();
    const startMinute = start.minute();

    // Calculate total minutes since the calendar's start
    const totalMinutes = (startHour - calendarStartHour) * 60 + startMinute;

    // Return the total pixel margin from the top
    return totalMinutes * minuteHeight();
  };

  return (
    <div
      class={`${styles.appointment} ${
        index === keyboardNavigationStore.selectedAppointmentIndex &&
        uiStore.calendarMode === CalendarMode.Appointment
          ? styles.selected
          : ""
      }`}
      style={{
        "margin-top": `${getMarginTop()}px`,
        height: `${minuteHeight() * length * 15}px`, // Convert length (quarters) to minutes
      }}
    >
      <div class={styles.appointmentTitle}>{title}</div>
    </div>
  );
};

export default Appointment;
