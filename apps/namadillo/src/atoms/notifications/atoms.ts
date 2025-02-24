import { atom } from "jotai";
import { ToastNotification } from "types";
import { notificationIdSeparator } from "./functions";

const toastNotificationsBaseAtom = atom<ToastNotification[]>([]);

export const toastNotificationsAtom = atom<ToastNotification[]>((get) =>
  get(toastNotificationsBaseAtom)
);

export const dispatchToastNotificationAtom = atom(
  null,
  (get, set, data: ToastNotification) => {
    const notifications = get(toastNotificationsBaseAtom);
    const filteredNotifications =
      data.id ?
        notifications.filter((n) => {
          const notificationId = n.id.toLowerCase();
          const dataId = data.id.toLowerCase();
          return !(
            notificationId === dataId ||
            notificationId.split(notificationIdSeparator).includes(dataId)
          );
        })
      : notifications;
    set(toastNotificationsBaseAtom, [...filteredNotifications, { ...data }]);
  }
);

export const dismissToastNotificationAtom = atom(
  null,
  (get, set, id: string) => {
    const notifications = get(toastNotificationsBaseAtom);
    set(
      toastNotificationsBaseAtom,
      notifications.filter((n) => n.id !== id)
    );
  }
);
