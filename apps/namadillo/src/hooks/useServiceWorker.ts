import { chainParametersAtom } from "atoms/chain";
import { useAtomValue } from "jotai";
import { useEffect, useState } from "react";

export const useServiceWorker = (): void => {
  const chain = useAtomValue(chainParametersAtom);
  const [registration, setRegistration] =
    useState<ServiceWorkerRegistration | null>(null);
  const chainId = chain.data?.chainId;

  useEffect(() => {
    (async () => {
      if ("serviceWorker" in navigator) {
        try {
          // This unfortunately does not work for vite dev in Firefox.
          // The reason is that vite injects node polyfills in form of ESM import statements
          // and firefox service worker does not support ESM imports yet.
          const registration = await navigator.serviceWorker.register(
            import.meta.env.MODE === "production" ?
              "/sw.js"
            : "/dev-sw.js?dev-sw",
            {
              type:
                import.meta.env.MODE === "production" ? "classic" : "module",
            }
          );

          if (registration.installing) {
            console.info("Service worker installing");
          } else if (registration.waiting) {
            console.info("Service worker installed");
          } else if (registration.active) {
            console.info("Service worker active");
            setRegistration(registration);
          }
        } catch (error) {
          console.error(`Registration failed with ${error}`);
        }
      }
    })();
  }, []);

  useEffect(() => {
    if (registration?.active) {
      registration.active.postMessage({ type: "CHAIN_CHANGE", chainId });
    }
  }, [chainId]);
};
