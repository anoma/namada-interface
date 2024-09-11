import { Stack } from "@namada/components";
import {
  dismissToastNotificationAtom,
  toastNotificationsAtom,
} from "atoms/notifications";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { useAtomValue, useSetAtom } from "jotai";
import { useCallback, useEffect, useRef, useState } from "react";
import { FaCheck, FaTimes } from "react-icons/fa";
import { FaRegHourglassHalf, FaXmark } from "react-icons/fa6";
import { GoAlert } from "react-icons/go";
import { ToastNotification } from "types";

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
  const [viewDetails, setViewDetails] = useState(false);
  const interval = useRef<NodeJS.Timeout>();

  const timeout =
    notification.timeout ??
    (notification.type === "success" ? 5000 : undefined);

  const closeNotification = (): void => {
    onClose(notification);
  };

  const keepNotification = (): void => {
    if (interval.current) {
      clearTimeout(interval.current);
      interval.current = undefined;
    }
  };

  const startTimeout = (): void => {
    if (typeof timeout !== "undefined" && !interval.current) {
      interval.current = setTimeout(() => {
        closeNotification();
      }, timeout);
    }
  };

  useEffect(() => {
    startTimeout();
  }, [notification.type]);

  return (
    <motion.div
      className={clsx(
        "relative w-[360px] rounded-md py-4 px-5 text-white",
        "grid grid-cols-[30px_auto] gap-5 z-[9999] leading-[1]",
        {
          "bg-success": notification.type === "success",
          "bg-intermediate": notification.type === "partialSuccess",
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
        {notification.type === "partialSuccess" && (
          <i className="text-2xl">
            <GoAlert />
          </i>
        )}
      </span>
      <Stack
        gap={0.5}
        className={clsx(
          "items-start relative break-words overflow-hidden",
          "max-w-full leading-normal"
        )}
      >
        <strong className="block text-sm">{notification.title}</strong>
        <div className="leading-tight text-xs">{notification.description}</div>
        {notification.type !== "partialSuccess" &&
          notification.type !== "error" &&
          notification.details &&
          !viewDetails && (
            <button
              className="text-xs text-white underline"
              onClick={() => setViewDetails(true)}
            >
              View details
            </button>
          )}
        {notification.details &&
          (viewDetails ||
            notification.type === "partialSuccess" ||
            notification.type === "error") && (
            <div className="w-full text-xs text-white block">
              {notification.details}
            </div>
          )}
      </Stack>
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
