import { createSignal, onMount } from "solid-js";
import styles from "./Appointment.module.css";

const Appointment = ({ length }: { length: number }) => {
  const [containerHeight, setContainerHeight] = createSignal<number>(0);

  onMount(() => {
    const containerHeight = document
      .getElementById("day-0-hour-8-quarter-0")
      ?.getBoundingClientRect()
      .height.toFixed(4) as unknown as number;

    setContainerHeight(containerHeight + 1 || 0);
  });

  return (
    <div
      class={styles.appointment}
      style={{
        "margin-top": containerHeight() * 2 - 1 + "px",
        height: containerHeight() * length + length + "px",
      }}
    >
      Test event
    </div>
  );
};

export default Appointment;
