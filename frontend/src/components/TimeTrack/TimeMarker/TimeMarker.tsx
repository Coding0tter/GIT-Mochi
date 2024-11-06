import { createSignal, onMount, onCleanup, Component } from "solid-js";
import styles from "./TimeMarker.module.css";

interface TimeMarkerProps {
  startHour: number;
  endHour: number;
}

const TimeMarker: Component<TimeMarkerProps> = (props) => {
  const [currentTimePosition, setCurrentTimePosition] = createSignal(0);

  const updateCurrentTimePosition = () => {
    const now = new Date();
    const totalMinutes = (props.endHour - props.startHour + 1) * 60;
    const currentMinutes =
      (now.getHours() - props.startHour) * 60 + now.getMinutes();

    const position = (currentMinutes / totalMinutes) * 100;

    setCurrentTimePosition(position);
  };

  onMount(() => {
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
    />
  );
};

export default TimeMarker;
