import { createSignal, createEffect } from "solid-js";

export interface Notification {
  id: number;
  title: string;
  description: string;
  type: "success" | "error" | "warning";
  duration: number; // duration in ms
}

const [notifications, setNotifications] = createSignal<Notification[]>([]);

export const addNotification = (
  notification: Omit<Partial<Notification>, "id">
) => {
  const id = new Date().getTime(); // unique id based on time
  const newNotification = {
    ...notification,
    id,
    duration: notification.duration || 3000,
  };
  setNotifications([...notifications(), newNotification as Notification]);

  // Remove notification after the duration
  setTimeout(() => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, notification.duration || 3000);
};

export const useNotifications = () => notifications;
