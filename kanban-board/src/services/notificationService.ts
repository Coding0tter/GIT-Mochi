import { createSignal } from "solid-js";

export interface Notification {
  id: number;
  title: string;
  description: string;
  type: "success" | "error" | "warning";
  duration: number;
}

const [notifications, setNotifications] = createSignal<Notification[]>([]);

export const addNotification = (
  notification: Omit<Partial<Notification>, "id">
) => {
  const id = new Date().getTime();
  const newNotification = {
    ...notification,
    id,
    duration: notification.duration || 3000,
  };
  setNotifications([...notifications(), newNotification as Notification]);

  setTimeout(() => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, notification.duration || 3000);
};

export const clearNotifications = () => setNotifications([]);

export const useNotifications = () => notifications;
