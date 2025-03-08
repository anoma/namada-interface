import { chainParametersAtom } from "atoms/chain/atoms";
import {
  indexerHeartbeatAtom,
  lastInvalidateShieldedContextAtom,
} from "atoms/settings/atoms";
import { useAtomValue } from "jotai";
import { useEffect } from "react";
import semverSatisfies from "semver/functions/satisfies";
import { useInvalidateShieldedContext } from "./useInvalidateShieldedContext";

// change this value to the minimun indexer version that demands to clear the context
const minIndexerVersion = ">=9.9.0";

export const useShouldInvalidateShieldedContext = (): void => {
  const lastInvalidate = useAtomValue(lastInvalidateShieldedContextAtom);
  const chainParameters = useAtomValue(chainParametersAtom);
  const indexerInfo = useAtomValue(indexerHeartbeatAtom);

  const invalidateShieldedContext = useInvalidateShieldedContext();

  const chainId = chainParameters.data?.chainId;
  const indexerVersion = indexerInfo.data?.version;

  useEffect(() => {
    if (!chainId || !indexerVersion) {
      return;
    }
    if (
      // indexer should be updated and satifies the minimum version
      semverSatisfies(indexerVersion, minIndexerVersion) &&
      // and the last clear contenxt should be done with an old indexer version
      !semverSatisfies(lastInvalidate[chainId] ?? "", minIndexerVersion)
    ) {
      invalidateShieldedContext();
    }
  }, [chainId, indexerVersion]);
};
