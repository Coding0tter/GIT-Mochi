import { type Component } from "solid-js";
import styles from "./WeekCalendarBody.module.css";
import TimeMarker from "../TimeMarker/TimeMarker";
import WeekCalendarHourRow from "../WeekCalendarHourRow/WeekCalendarHourRow";

interface WeekCalendarBodyProps {
  weekDates: Date[];
  startHour: number;
  endHour: number;
  currentDay: Date;
}

const WeekCalendarBody: Component<WeekCalendarBodyProps> = (props) => {
  return (
    <div id="calendar-body" class={styles.weekCalendarBody}>
      {Array.from(
        { length: props.endHour - props.startHour + 1 },
        (_, idx) => props.startHour + idx
      ).map((hour) => (
        <>
          <WeekCalendarHourRow
            hour={hour}
            weekDates={props.weekDates}
            currentDay={props.currentDay}
          />
        </>
      ))}
      <TimeMarker startHour={props.startHour} endHour={props.endHour} />
    </div>
  );
};

export default WeekCalendarBody;
