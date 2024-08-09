import { Stack } from "@namada/components";
import {
  dismissToastNotificationAtom,
  toastNotificationsAtom,
} from "atoms/notifications";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { useAtomValue, useSetAtom } from "jotai";
import { useCallback, useEffect, useRef } from "react";
import { FaCheck, FaTimes } from "react-icons/fa";
import { FaRegHourglassHalf, FaXmark } from "react-icons/fa6";
import { ToastNotification } from "types/notifications";

export const Toasts = (): JSX.Element => {
  const dismiss = useSetAtom(dismissToastNotificationAtom);
  const notifications = useAtomValue(toastNotificationsAtom);
  const onClose = useCallback((notification: ToastNotification): void => {
    dismiss(notification.id);
  }, []);

  return (
    <div className="fixed right-4 top-4 z-[9999]">
      <AnimatePresence>
        <Stack gap={2}>
          {notifications.map((n) => (
            <Toast key={`toast-${n.id}`} notification={n} onClose={onClose} />
          ))}
        </Stack>
      </AnimatePresence>
    </div>
  );
};

type ToastProps = {
  notification: ToastNotification;
  onClose: (notification: ToastNotification) => void;
};

const Toast = ({ notification, onClose }: ToastProps): JSX.Element => {
  const interval = useRef<NodeJS.Timeout>();

  const closeNotification = (): void => {
    onClose(notification);
  };

  const keepNotification = (): void => {
    if (notification.timeout && interval.current) {
      clearTimeout(interval.current);
      interval.current = undefined;
    }
  };

  const startTimeout = (): void => {
    if (notification.timeout && !interval.current) {
      interval.current = setTimeout(() => {
        closeNotification();
      }, notification.timeout);
    }
  };

  useEffect(() => {
    startTimeout();
  }, []);

  return (
    <motion.div
      className={clsx(
        "relative w-[360px] rounded-md py-4 px-5 text-white",
        "grid grid-cols-[30px_auto] gap-5 z-[9999] leading-[1]",
        {
          "bg-success": notification.type === "success",
          "bg-fail": notification.type === "error",
          "bg-neutral-500": notification.type === "pending",
        }
      )}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseEnter={keepNotification}
      onMouseLeave={startTimeout}
    >
      <span className="flex h-full items-center justify-center">
        {notification.type === "success" && (
          <i className="text-2xl">
            <FaCheck />
          </i>
        )}
        {notification.type === "error" && (
          <i className="text-2xl">
            <FaTimes />
          </i>
        )}
        {notification.type === "pending" && (
          <i className="block text-xl animate-niceSpin">
            <FaRegHourglassHalf />
          </i>
        )}
      </span>
      <div className="relative">
        <strong className="block text-sm mb-1">{notification.title}</strong>
        <div className="leading-tight text-xs">{notification.description}</div>
      </div>
      <i
        onClick={() => onClose(notification)}
        className={clsx(
          "absolute right-1 top-1 p-1.5 flex items-center",
          "justify-center cursor-pointer"
        )}
      >
        <FaXmark />
      </i>
    </motion.div>
  );
};
