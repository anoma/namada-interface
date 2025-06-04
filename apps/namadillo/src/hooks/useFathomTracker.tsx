import { defaultServerConfigAtom } from "atoms/settings";
import * as Fathom from "fathom-client";
import { useAtomValue } from "jotai";
import { useEffect } from "react";

export const useFathomTracker = (): void => {
  const tomlConfig = useAtomValue(defaultServerConfigAtom);
  useEffect(() => {
    if (tomlConfig.data?.fathom_site_id) {
      Fathom.load(tomlConfig.data.fathom_site_id, { honorDNT: true });
    }
  }, [tomlConfig.data?.fathom_site_id]);
};
