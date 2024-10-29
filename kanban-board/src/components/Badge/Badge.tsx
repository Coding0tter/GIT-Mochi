import { JSXElement } from "solid-js";
import styles from "./Badge.module.css";

type BadgeProps = {
  type?:
    | "issue"
    | "merge_request"
    | "custom"
    | "high"
    | "medium"
    | "low"
    | string;
  children: JSXElement;
};

const Badge = ({ type = "custom", children }: BadgeProps) => {
  return <span class={`${styles.badge} ${styles[type]}`}>{children}</span>;
};

export default Badge;
