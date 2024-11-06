import { createSignal, onMount } from "solid-js";
import WeekCalendarBody from "../WeekCalendarBody/WeekCalendarBody";
import WeekCalendarHeader from "../WeekCalendarHeader/WeekCalendarHeader";
import styles from "./WeekCalendar.module.css";
import {
  setSelectedDayIndex,
  setSelectedHourIndex,
  setSelectedQuarterHourIndex,
} from "../../../stores/keyboardNavigationStore";

interface WeekCalendarProps {
  startHour?: number;
  endHour?: number;
}

function WeekCalendar(props: WeekCalendarProps) {
  const startHour = props.startHour ?? 0;
  const endHour = props.endHour ?? 23;

  // Signal for the current date
  const [currentDay, setCurrentDay] = createSignal(new Date());

  // Calculate the dates for the current week starting from Monday
  const [weekDates, setWeekDates] = createSignal<Date[]>([]);

  onMount(() => {
    const today = new Date();
    const dayOfWeek = (today.getDay() + 6) % 7;
    const monday = new Date(today);
    monday.setDate(today.getDate() - dayOfWeek);

    const dates = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      return date;
    });

    setSelectedDayIndex(dayOfWeek);
    setSelectedHourIndex(today.getHours());
    setSelectedQuarterHourIndex(Math.floor(today.getMinutes() / 15));
    setWeekDates(dates);
  });

  return (
    <div class={styles.weekCalendar}>
      <WeekCalendarHeader weekDates={weekDates()} currentDay={currentDay()} />
      <WeekCalendarBody
        weekDates={weekDates()}
        startHour={startHour}
        endHour={endHour}
        currentDay={currentDay()}
      />
    </div>
  );
}

export default WeekCalendar;
