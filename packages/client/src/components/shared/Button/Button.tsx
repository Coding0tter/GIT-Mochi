import type { JSXElement } from "solid-js";
import styles from "./Button.module.css";

type ButtonProps = {
  children: JSXElement | string;
  disabled?: boolean;
  type?: "primary" | "secondary" | "default";
  onClick: (e: MouseEvent) => void;
  style?: any;
};

const Button = (props: ButtonProps) => {
  return (
    <button
      style={props.style}
      disabled={props.disabled}
      class={`${styles.mochiButton} ${styles[props.type ?? "default"]}`}
      onClick={props.onClick}
    >
      {props.children}
    </button>
  );
};

export default Button;
