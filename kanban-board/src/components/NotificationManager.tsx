import { For } from "solid-js";
import { useNotifications } from "../services/notificationService";
import NotificationComponent from "./Notification";

const NotificationManager = () => {
  const notifications = useNotifications();

  return (
    <div class="notification-manager">
      <For each={notifications()}>
        {(notification) => (
          <NotificationComponent notification={notification} />
        )}
      </For>
    </div>
  );
};

export default NotificationManager;
