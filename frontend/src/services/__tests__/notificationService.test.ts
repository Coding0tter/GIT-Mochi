import { beforeEach, describe, expect, test } from "bun:test";
import {
  addNotification,
  clearNotifications,
  useNotifications,
  Notification,
} from "../notificationService";

beforeEach(() => {
  clearNotifications();
});

describe("NotificationService", () => {
  test("should add notification", () => {
    const notification = {
      title: "Test",
      description: "Test",
      type: "success",
    } as Notification;

    addNotification(notification);

    const notifications = useNotifications();

    expect(notifications().length).toBe(1);
    expect(notifications()[0]).toMatchObject(notification);
  });

  test("should remove notification after duration", async () => {
    const notification = {
      title: "Test",
      description: "Test",
      type: "success",
      duration: 100,
    } as Notification;

    addNotification(notification);

    const notifications = useNotifications();

    expect(notifications().length).toBe(1);

    await new Promise((resolve) => setTimeout(resolve, 200));

    expect(notifications().length).toBe(0);
  });

  test("should remove notification on clear", () => {
    const notification = {
      title: "Test",
      description: "Test",
      type: "success",
    } as Notification;

    addNotification(notification);

    const notifications = useNotifications();

    expect(notifications().length).toBe(1);

    clearNotifications();

    expect(notifications().length).toBe(0);
  });
});
