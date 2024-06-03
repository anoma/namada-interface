import { useSetAtom } from "jotai";
import { AtomWithQueryResult } from "jotai-tanstack-query";
import { useEffect } from "react";
import {
  dismissToastNotificationAtom,
  dispatchToastNotificationAtom,
} from "slices/notifications";
import { ToastNotification } from "types/notifications";

export const atomsAreFetching = (...args: AtomWithQueryResult[]): boolean => {
  return args.reduce((prev, current) => prev || current.isPending, false);
};

export const atomsAreLoaded = (...args: AtomWithQueryResult[]): boolean => {
  return args.reduce((prev, current) => prev && current.isSuccess, true);
};

export const atomsAreError = (...args: AtomWithQueryResult[]): boolean => {
  return args.reduce((prev, current) => prev || current.isError, false);
};

export const useNotifyOnAtomError = (
  atoms: AtomWithQueryResult[],
  deps: React.DependencyList
): void => {
  const dispatchNotification = useSetAtom(dispatchToastNotificationAtom);
  const dismissNotification = useSetAtom(dismissToastNotificationAtom);

  const toast: ToastNotification = {
    id: "something-went-wrong",
    title: "Something went wrong",
    description: "Try checking your network settings and refreshing the page",
    type: "error",
  };

  useEffect(() => {
    if (atomsAreError(...atoms)) {
      dismissNotification(toast.id);
      dispatchNotification(toast);
    }
  }, deps);
};
