import { For } from "solid-js";
import styles from "./WaveText.module.css";
import dayjs from "dayjs";

interface WaveTextProps {
  text: () => string;
  class?: string;
}

export function WaveText(props: WaveTextProps) {
  const isJune = dayjs().month() === 5;

  return (
    <div
      class={`${styles.waveText} ${isJune ? styles.pride : ""} ${props.class || ""}`}
    >
      <For each={props.text().split("")}>
        {(char, index) => (
          <span
            style={{
              "animation-delay": `${index() * 0.1}s`,
            }}
          >
            {char === " " ? "\u00A0" : char}
          </span>
        )}
      </For>
    </div>
  );
}
