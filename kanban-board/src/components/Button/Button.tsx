import { JSXElement } from "solid-js";
import styles from "./Button.module.css";

type ButtonProps = {
  children: JSXElement | string;
  disabled?: boolean;
  type?: "primary" | "secondary" | "default";
  onClick: () => void;
};

const Button = ({ children, onClick, disabled, type = "default" }: ButtonProps) => {
  return (
    <button disabled={disabled} class={`${styles.mochiButton} ${styles[type]}`} onClick={onClick}>
      {children}
    </button>
  );
};

export default Button;
