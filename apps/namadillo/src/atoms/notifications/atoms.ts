import { atom } from "jotai";
import { ToastNotification, ToastNotificationEntryFilter } from "types";

const toastNotificationsBaseAtom = atom<ToastNotification[]>([]);

export const toastNotificationsAtom = atom<ToastNotification[]>((get) =>
  get(toastNotificationsBaseAtom)
);

export const dispatchToastNotificationAtom = atom(
  null,
  (get, set, data: ToastNotification) => {
    const notifications = get(toastNotificationsBaseAtom);
    set(toastNotificationsBaseAtom, [...notifications, { ...data }]);
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

export const filterToastNotificationsAtom = atom(
  null,
  (get, set, filterFn: ToastNotificationEntryFilter) => {
    const notifications = get(toastNotificationsBaseAtom);
    set(toastNotificationsBaseAtom, notifications.filter(filterFn));
  }
);
