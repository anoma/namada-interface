import { defaultServerConfigAtom } from "atoms/settings";
import { load, trackEvent, trackPageview } from "fathom-client";
import { useAtomValue } from "jotai";
import { useEffect, useState } from "react";
import { matchPath, useLocation } from "react-router-dom";

type FathomTrackerOutput = {
  trackEvent: (eventName: string) => void;
};

export const useFathomTracker = (loadFathom = false): FathomTrackerOutput => {
  const { pathname } = useLocation();
  const [initialized, setInitialized] = useState(false);
  const tomlConfig = useAtomValue(defaultServerConfigAtom);
  const fathomSiteId = tomlConfig.data?.fathom_site_id;
  const doNotTrackRoutes = ["/transaction/:hash"];

  useEffect(() => {
    if (fathomSiteId && loadFathom && !initialized) {
      setInitialized(true);
      load(fathomSiteId, {
        honorDNT: true,
        auto: false,
      });
    }
  }, [fathomSiteId]);

  useEffect(() => {
    if (!initialized || !loadFathom) return;
    if (fathomSiteId) {
      const doNotTrack = doNotTrackRoutes.some((route) =>
        matchPath(route, pathname)
      );

      if (doNotTrack) {
        return;
      }

      trackPageview({
        url: pathname,
        referrer: document.referrer,
      });
    }
  }, [fathomSiteId, initialized, pathname]);

  return {
    trackEvent: (eventName: string) => {
      if (fathomSiteId) {
        trackEvent(eventName);
      }
    },
  };
};
