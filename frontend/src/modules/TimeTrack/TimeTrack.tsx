import { onMount } from "solid-js";
import styles from "./TimeTrack.module.css";
import WeekCalendar from "../../components/TimeTrack/WeekCalendar/WeekCalendar";

const TimeTrack = () => {
  onMount(() => {});

  return (
    <>
      <div class={styles.timetrack}>
        <WeekCalendar startHour={8} endHour={20} />
      </div>
    </>
  );
};

export default TimeTrack;
