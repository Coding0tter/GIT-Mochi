import WeekCalendar from "../../components/TimeTrack/WeekCalendar/WeekCalendar";
import styles from "./TimeTrack.module.css";

const TimeTrack = () => {
  return (
    <>
      <div class={styles.timetrack}>
        <WeekCalendar startHour={8} endHour={20} />
      </div>
    </>
  );
};

export default TimeTrack;
