import { defaultServerConfigAtom } from "atoms/settings";
import { load, trackEvent, trackPageview } from "fathom-client";
import { useAtomValue } from "jotai";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

type FathomTrackerOutput = {
  trackEvent: (eventName: string) => void;
};

export const useFathomTracker = (): FathomTrackerOutput => {
  const { pathname, hash, search } = useLocation();
  const tomlConfig = useAtomValue(defaultServerConfigAtom);
  const fathomSiteId = tomlConfig.data?.fathom_site_id;

  useEffect(() => {
    if (tomlConfig.data?.fathom_site_id) {
      load(tomlConfig.data.fathom_site_id, {
        honorDNT: true,
        auto: false,
      });
    }
  }, [fathomSiteId]);

  useEffect(() => {
    if (tomlConfig.data?.fathom_site_id) {
      trackPageview({
        url: location.pathname + search + hash,
        referrer: document.referrer,
      });
    }
  }, [fathomSiteId, pathname, search, hash]);

  return {
    trackEvent: (eventName: string) => {
      if (tomlConfig.data?.fathom_site_id) {
        trackEvent(eventName);
      }
    },
  };
};
