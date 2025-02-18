import { atom } from "jotai";
import { ToastNotification } from "types";

const toastNotificationsBaseAtom = atom<ToastNotification[]>([]);

export const toastNotificationsAtom = atom<ToastNotification[]>((get) =>
  get(toastNotificationsBaseAtom)
);

export const dispatchToastNotificationAtom = atom(
  null,
  (get, set, data: ToastNotification) => {
    const notifications = get(toastNotificationsBaseAtom);
    const filteredNotifications =
      data.id ? notifications.filter((n) => n.id !== data.id) : notifications;
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
