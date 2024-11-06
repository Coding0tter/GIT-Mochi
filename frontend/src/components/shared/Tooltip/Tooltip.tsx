import { JSXElement } from "solid-js";
import styles from "./Tooltip.module.css";

type TooltipProps = {
  children: JSXElement;
  text: string | JSXElement;
};

const Tooltip = ({ children, text }: TooltipProps) => {
  return (
    <span class={styles.tooltip}>
      {children}
      <span class={styles.tooltipText}>{text}</span>
    </span>
  );
};

export default Tooltip;
