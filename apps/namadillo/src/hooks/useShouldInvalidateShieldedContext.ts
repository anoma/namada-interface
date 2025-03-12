import { chainParametersAtom } from "atoms/chain/atoms";
import {
  lastInvalidateShieldedContextAtom,
  maspIndexerHeartbeatAtom,
} from "atoms/settings/atoms";
import { useAtom, useAtomValue } from "jotai";
import { RESET } from "jotai/utils";
import { useEffect } from "react";
import semverSatisfies from "semver/functions/satisfies";
import { version as namadilloVersion } from "../../package.json";
import { useInvalidateShieldedContext } from "./useInvalidateShieldedContext";

// change these values to the minimun versions that demands to clear the context
const minNamadilloVersion = ">=1.18.0";
const minMaspIndexerVersion = ">=1.1.3";

export const useShouldInvalidateShieldedContext = (): void => {
  const [lastInvalidate, setLastInvalidate] = useAtom(
    lastInvalidateShieldedContextAtom
  );
  const chainParameters = useAtomValue(chainParametersAtom);
  const maspIndexerInfo = useAtomValue(maspIndexerHeartbeatAtom);

  const invalidateShieldedContext = useInvalidateShieldedContext();

  const chainId = chainParameters.data?.chainId;
  const maspIndexerVersion = maspIndexerInfo.data?.version;

  useEffect(() => {
    if (!chainId || !maspIndexerVersion) {
      return;
    }

    const last = lastInvalidate[chainId];
    // old model saved as string, reset the storage value
    if (typeof last === "string") {
      setLastInvalidate(RESET);
      return;
    }

    if (
      // namadillo should be updated and satifies the minimum version
      semverSatisfies(namadilloVersion, minNamadilloVersion) &&
      // masp indexer should be updated and satifies the minimum version
      semverSatisfies(maspIndexerVersion, minMaspIndexerVersion) &&
      // and the last clear context should be done with an old masp indexer version
      !semverSatisfies(last?.maspIndexerVersion ?? "", minMaspIndexerVersion)
    ) {
      invalidateShieldedContext();
    }
  }, [chainId, maspIndexerVersion, lastInvalidate]);
};
