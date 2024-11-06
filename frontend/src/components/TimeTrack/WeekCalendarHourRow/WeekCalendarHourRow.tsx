import { Component } from "solid-js";
import styles from "./WeekCalendarHourRow.module.css";
import { keyboardNavigationStore } from "../../../stores/keyboardNavigationStore";

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
              class={`${styles.weekCalendarQuarterHourCell} ${
                date.toDateString() === props.currentDay.toDateString()
                  ? styles.currentDay
                  : ""
              } ${
                keyboardNavigationStore.selectedDayIndex === dayOfWeek &&
                keyboardNavigationStore.selectedHourIndex === props.hour &&
                keyboardNavigationStore.selectedQuarterHourIndex === index
                  ? styles.selectedCell
                  : ""
              }`}
            ></div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default WeekCalendarHourRow;
