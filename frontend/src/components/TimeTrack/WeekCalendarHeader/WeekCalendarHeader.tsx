import { Component } from "solid-js";
import styles from "./WeekCalendarHeader.module.css";

interface WeekCalendarHeaderProps {
  weekDates: Date[];
  currentDay: Date;
}

const WeekCalendarHeader: Component<WeekCalendarHeaderProps> = (props) => {
  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  return (
    <div class={styles.weekCalendarHeader}>
      <div class={styles.weekCalendarHeaderTimeLabel}></div>
      {props.weekDates.map((date, index) => (
        <div
          class={`${styles.weekCalendarHeaderDay}${
            date.toDateString() === props.currentDay.toDateString()
              ? ` ${styles.currentDay}`
              : ""
          }`}
        >
          <div class={styles.weekCalendarDayName}>{daysOfWeek[index]}</div>
          <div class={styles.weekCalendarDate}>
            {date.toLocaleDateString("de-DE")}
          </div>
        </div>
      ))}
    </div>
  );
};

export default WeekCalendarHeader;
