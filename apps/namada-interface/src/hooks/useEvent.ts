import { useEffect } from "react";

export const useEventListener = (
  event: string,
  handler: (e: CustomEventInit) => void,
  deps?: React.DependencyList,
  useCapture = false
): void => {
  useEffect(() => {
    window.addEventListener(event, handler, useCapture);

    return () => {
      window.removeEventListener(event, handler);
    };
  }, deps);
};

export const useEventListenerOnce = (
  event: string,
  handler: (e: CustomEventInit) => void,
  useCapture = false
): void => {
  useEventListener(event, handler, [], useCapture);
};
