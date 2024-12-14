import { createEffect, onCleanup } from "solid-js";
import type { Notification } from "@client/services/notificationService";
import styles from "./Notification.module.css";

const NotificationComponent = (props: { notification: Notification }) => {
  let notificationRef: HTMLElement | null = null;

  createEffect(() => {
    setTimeout(() => {
      if (notificationRef) {
        notificationRef.style.opacity = "1";
        notificationRef.style.transform = "translateY(0)";
      }
    }, 0);

    const timeoutId = setTimeout(() => {
      if (notificationRef) {
        notificationRef.style.opacity = "0";
        notificationRef.style.transform = "translateX(20px)";
      }
    }, props.notification.duration - 300);

    onCleanup(() => clearTimeout(timeoutId));
  });

  return (
    <div
      ref={(el) => (notificationRef = el)}
      class={`${styles.notification} ${styles[props.notification.type]}`}
      style={{
        opacity: 0,
        transform: "translateY(20px)",
        transition: "opacity 0.3s ease-in-out, transform 0.3s ease-in-out",
      }}
    >
      <strong>{props.notification.title}</strong>
      <p>{props.notification.description}</p>
    </div>
  );
};

export default NotificationComponent;
