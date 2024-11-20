import { createSignal, onMount, onCleanup, Component } from "solid-js";
import styles from "./TimeMarker.module.css";

interface TimeMarkerProps {
  startHour: number;
  endHour: number;
}

const TimeMarker: Component<TimeMarkerProps> = (props) => {
  const [currentTimePosition, setCurrentTimePosition] = createSignal(0);
  const [currentTime, setCurrentTime] = createSignal(new Date());

  const updateCurrentTimePosition = () => {
    const now = new Date();
    setCurrentTime(now);
    const totalMinutes = (props.endHour - props.startHour + 1) * 60;
    const currentMinutes =
      (now.getHours() - props.startHour) * 60 + now.getMinutes();

    const position = Math.max(
      Math.min((currentMinutes / totalMinutes) * 100, 99),
      0
    );

    setCurrentTimePosition(position);
  };

  onMount(async () => {
    updateCurrentTimePosition();
    const interval = setInterval(updateCurrentTimePosition, 60000);
    onCleanup(() => clearInterval(interval));
  });

  return (
    <div
      class={styles.currentTimeMarker}
      style={{
        top: `${currentTimePosition()}%`,
      }}
    >
      <div class={styles.time}>
        {" "}
        {currentTime().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })}
      </div>
    </div>
  );
};

export default TimeMarker;
