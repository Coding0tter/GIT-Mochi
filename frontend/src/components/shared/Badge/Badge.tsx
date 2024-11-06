import { JSXElement } from "solid-js";
import styles from "./Badge.module.css";
import { addNotification } from "../../../services/notificationService";
import Tooltip from "../Tooltip/Tooltip";

type BadgeProps = {
  type?:
    | "issue"
    | "merge_request"
    | "custom"
    | "high"
    | "medium"
    | "low"
    | string;
  cutOffText?: boolean;
  clipBoardText?: string;
  hasTooltip?: boolean;
  children: JSXElement;
};

const Badge = ({
  type = "custom",
  children,
  cutOffText,
  clipBoardText,
  hasTooltip,
}: BadgeProps) => {
  const copyToClipboard = (event: MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();

    if (!clipBoardText) return;
    navigator.clipboard.writeText(clipBoardText);

    addNotification({
      type: "success",
      title: "Copied to clipboard",
      duration: 1000,
    });
  };

  return (
    <span onClick={copyToClipboard}>
      {hasTooltip ? (
        <Tooltip text={children}>
          <span
            class={`${styles.badge} ${styles[type]} ${
              cutOffText ? styles.maxLength : ""
            }`}
          >
            {children}
          </span>
        </Tooltip>
      ) : (
        <span
          class={`${styles.badge} ${styles[type]} ${
            cutOffText ? styles.maxLength : ""
          }`}
        >
          {children}
        </span>
      )}
    </span>
  );
};

export default Badge;
