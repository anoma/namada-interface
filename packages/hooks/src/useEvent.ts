import { useEffect } from "react";

type EventHandler = (e: CustomEventInit) => void;
type EventCallback = (event: string, handler: EventHandler) => void;

export const useEventListener = (
  event: string,
  handler: EventHandler,
  deps?: React.DependencyList,
  useCapture = false,
  registerCallback?: EventCallback,
  removeCallback?: EventCallback
): void => {
  useEffect(() => {
    registerCallback
      ? registerCallback(event, handler)
      : window.addEventListener(event, handler, useCapture);

    return () => {
      if (removeCallback) {
        return removeCallback(event, handler);
      }
      window.removeEventListener(event, handler);
    };
  }, deps);
};

export const useEventListenerOnce = (
  event: string,
  handler: EventHandler,
  useCapture = false,
  registerCallback?: EventCallback,
  removeCallback?: EventCallback
): void => {
  useEventListener(
    event,
    handler,
    [],
    useCapture,
    registerCallback,
    removeCallback
  );
};
