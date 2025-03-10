import { chainParametersAtom } from "atoms/chain/atoms";
import {
  lastInvalidateShieldedContextAtom,
  maspIndexerHeartbeatAtom,
} from "atoms/settings/atoms";
import { useAtomValue } from "jotai";
import { useEffect } from "react";
import semverSatisfies from "semver/functions/satisfies";
import { useInvalidateShieldedContext } from "./useInvalidateShieldedContext";

// change this value to the minimun masp indexer version that demands to clear the context
const minMaspIndexerVersion = ">=1.1.0";

export const useShouldInvalidateShieldedContext = (): void => {
  const lastInvalidate = useAtomValue(lastInvalidateShieldedContextAtom);
  const chainParameters = useAtomValue(chainParametersAtom);
  const maspIndexerInfo = useAtomValue(maspIndexerHeartbeatAtom);

  const invalidateShieldedContext = useInvalidateShieldedContext();

  const chainId = chainParameters.data?.chainId;
  const maspIndexerVersion = maspIndexerInfo.data?.version;

  useEffect(() => {
    if (!chainId || !maspIndexerVersion) {
      return;
    }
    if (
      // masp indexer should be updated and satifies the minimum version
      semverSatisfies(maspIndexerVersion, minMaspIndexerVersion) &&
      // and the last clear context should be done with an old masp indexer version
      !semverSatisfies(lastInvalidate[chainId] ?? "", minMaspIndexerVersion)
    ) {
      invalidateShieldedContext();
    }
  }, [chainId, maspIndexerVersion]);
};
