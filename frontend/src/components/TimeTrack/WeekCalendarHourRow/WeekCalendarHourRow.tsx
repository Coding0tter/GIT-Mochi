import { Component } from "solid-js";
import styles from "./WeekCalendarHourRow.module.css";
import { keyboardNavigationStore } from "../../../stores/keyboardNavigationStore";
import Appointment from "../Appointment/Appointment";

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
                keyboardNavigationStore.selectedQuarterHourIndex === index
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
            {dayOfWeek === 0 && props.hour === 11 && (
              <Appointment length={24} />
            )}
            {dayOfWeek === 0 && props.hour === 11 && (
              <Appointment length={10} />
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default WeekCalendarHourRow;
