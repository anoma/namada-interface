import { useEffect } from "react";

export const useEventListener = (
  event: string,
  handler: (e: CustomEventInit) => void,
  deps?: React.DependencyList,
  useCapture = false,
  isEthereumEvent = false
): void => {
  useEffect(() => {
    isEthereumEvent
      ? window.ethereum.on(event, handler)
      : window.addEventListener(event, handler, useCapture);

    return () => {
      if (isEthereumEvent) {
        return window.ethereum.removeListener(event, handler);
      }
      window.removeEventListener(event, handler);
    };
  }, deps);
};

export const useEventListenerOnce = (
  event: string,
  handler: (e: CustomEventInit) => void,
  useCapture = false,
  isEthereumEvent = false
): void => {
  useEventListener(event, handler, [], useCapture, isEthereumEvent);
};
