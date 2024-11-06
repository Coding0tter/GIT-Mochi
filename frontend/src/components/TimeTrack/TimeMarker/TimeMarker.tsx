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
    const hour = 18;
    const minutes = now.getMinutes();
    const totalMinutes = (hour - props.startHour) * 60 + minutes;
    const totalHeight = (props.endHour - props.startHour + 1) * 60;
    const position = (totalMinutes / totalHeight) * 100;
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
