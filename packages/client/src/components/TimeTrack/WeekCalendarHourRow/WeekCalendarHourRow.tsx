import { type Component, Index } from "solid-js";
import styles from "./WeekCalendarHourRow.module.css";
import { keyboardNavigationStore } from "../../../stores/keyboardNavigationStore";
import Appointment from "../Appointment/Appointment";
import { timeTrackStore } from "../../../stores/timeTrackStore";
import dayjs from "dayjs";
import { CalendarMode, uiStore } from "../../../stores/uiStore";

interface WeekCalendarHourRowProps {
  hour: number;
  weekDates: Date[];
  currentDay: Date;
}

const WeekCalendarHourRow: Component<WeekCalendarHourRowProps> = (props) => {
  return (
    <div class={styles.weekCalendarHourRow}>
      <div class={styles.weekCalendarHourLabel}>{props.hour}:00</div>
      {props.weekDates.map((date, dayOfWeek) => (
        <div class={styles.weekCalendarDayColumn}>
          {Array.from({ length: 4 }, (_, index) => (
            <div
              id={`day-${dayOfWeek}-hour-${props.hour}-quarter-${index}`}
              class={`${styles.weekCalendarQuarterHourCell} ${
                date.toDateString() === props.currentDay.toDateString()
                  ? styles.currentDay
                  : ""
              } ${
                keyboardNavigationStore.selectedDayIndex === dayOfWeek &&
                keyboardNavigationStore.selectedHourIndex === props.hour &&
                keyboardNavigationStore.selectedQuarterHourIndex === index &&
                uiStore.calendarMode === CalendarMode.Time
                  ? styles.activeCell
                  : ""
              } ${
                keyboardNavigationStore.selectedQuarterHourIndexes.length > 1 &&
                keyboardNavigationStore.selectedQuarterHourIndexes.includes(
                  props.hour * 4 + index
                ) &&
                keyboardNavigationStore.selectedDayIndex === dayOfWeek
                  ? styles.selectedCell
                  : ""
              }`}
            />
          ))}
          <div class={styles.appointmentWrapper}>
            {props.hour == 8 && (
              <Index each={timeTrackStore.entries}>
                {(entry, index) => {
                  const entryDate = dayjs(entry().start).day() - 1;

                  if (entryDate === dayOfWeek) {
                    const end = entry()?.end ? dayjs(entry().end) : dayjs();
                    const start = dayjs(entry().start).subtract(1, "hour");
                    const length = end.diff(start, "minute");

                    return (
                      <Appointment
                        index={index}
                        start={start}
                        length={Math.max(Math.ceil(length / 15), 1)}
                        title="Worktime"
                      />
                    );
                  }
                  return null;
                }}
              </Index>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default WeekCalendarHourRow;
