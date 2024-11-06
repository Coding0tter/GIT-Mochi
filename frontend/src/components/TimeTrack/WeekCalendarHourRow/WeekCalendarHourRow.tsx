import { Component } from "solid-js";
import styles from "./WeekCalendarHourRow.module.css";

interface WeekCalendarHourRowProps {
  hour: number;
  weekDates: Date[];
  currentDay: Date;
}

const WeekCalendarHourRow: Component<WeekCalendarHourRowProps> = (props) => {
  return (
    <div class={styles.weekCalendarHourRow}>
      <div class={styles.weekCalendarHourLabel}>{props.hour}:00</div>
      {props.weekDates.map((date) => (
        <div class={styles.weekCalendarDayColumn}>
          {Array.from({ length: 4 }, (_, index) => (
            <div
              class={`${styles.weekCalendarQuarterHourCell} ${
                date.toDateString() === props.currentDay.toDateString()
                  ? styles.currentDay
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
