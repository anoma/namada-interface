import { atom } from "jotai";
import { ToastNotification } from "types/notifications";

type ToastNotificationOptions = {
  timeout?: number;
};

export type ToastNotificationEntry = {
  options: ToastNotificationOptions;
  data: ToastNotification;
};

const toastNotificationsBaseAtom = atom<ToastNotificationEntry[]>([]);
export const toastNotificationsAtom = atom<ToastNotificationEntry[]>((get) =>
  get(toastNotificationsBaseAtom)
);

export const dispatchToastNotificationAtom = atom(
  null,
  (
    get,
    set,
    data: ToastNotification,
    options: ToastNotificationOptions = {}
  ) => {
    const notifications = get(toastNotificationsBaseAtom);
    set(toastNotificationsBaseAtom, [...notifications, { data, options }]);
  }
);

export const dismissToastNotificationAtom = atom(
  null,
  (get, set, data: ToastNotification) => {
    const notifications = get(toastNotificationsBaseAtom);
    set(
      toastNotificationsBaseAtom,
      notifications.filter((n) => n.data.id !== data.id)
    );
  }
);
