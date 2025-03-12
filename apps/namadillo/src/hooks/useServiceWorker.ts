import { chainParametersAtom, maspEpochAtom } from "atoms/chain";
import { useAtomValue } from "jotai";
import { useEffect, useState } from "react";

export const useServiceWorker = (): void => {
  const chain = useAtomValue(chainParametersAtom);
  const [registration, setRegistration] =
    useState<ServiceWorkerRegistration | null>(null);
  const chainId = chain.data?.chainId;
  const maspEpochQuery = useAtomValue(maspEpochAtom);
  const maspEpoch = maspEpochQuery.data;

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

          // If the service worker is already active, we can use it immediately
          if (registration.active) {
            setRegistration(registration);
          } else if (registration.installing) {
            // Listen for the state changes
            registration.installing.addEventListener("statechange", (event) => {
              const sw = event.target as ServiceWorker;
              if (sw.state === "activated") {
                setRegistration(registration);
              }
            });
          }
        } catch (error) {
          console.error(`Registration failed with ${error}`);
        }
      }
    })();
  }, []);

  useEffect(() => {
    if (chainId && registration?.active && maspEpoch) {
      registration.active.postMessage({
        type: "CACHE_NAME",
        chainId,
        maspEpoch,
      });
    }
  }, [chainId, maspEpoch, registration?.active]);
};
