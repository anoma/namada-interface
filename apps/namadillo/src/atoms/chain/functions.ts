import { Asset } from "@chain-registry/types";
import { IbcToken, NativeToken, Parameters } from "@namada/indexer-client";
import { singleUnitDurationFromInterval } from "@namada/utils/helpers";

export const calculateUnbondingPeriod = (parameters: Parameters): string => {
  const unbondingPeriodInEpochs =
    Number(parameters.unbondingLength) +
    Number(parameters.pipelineLength) +
    Number(parameters.cubicSlashingWindowLength);
  const minEpochDuration = Number(parameters.minDuration);
  const maxBlockTime = Number(parameters.maxBlockTime);
  const epochSwitchBlocksDelay = Number(parameters.epochSwitchBlocksDelay);

  const realMinEpochDuration =
    minEpochDuration + maxBlockTime * epochSwitchBlocksDelay;

  return singleUnitDurationFromInterval(
    0,
    unbondingPeriodInEpochs * realMinEpochDuration
  );
};

export const findAssetByToken = (
  token: NativeToken | IbcToken,
  assets: Asset[]
): Asset | undefined => {
  if ("trace" in token) {
    const traceDenom = token.trace.split("/").at(-1);
    if (traceDenom) {
      for (let i = 0; i < assets.length; i++) {
        const asset = assets[i];
        if (
          asset.base === traceDenom ||
          asset.denom_units.find(
            (u) => u.denom === traceDenom || u.aliases?.includes(traceDenom)
          )
        ) {
          return asset;
        }
      }
    }
  }
  // If the token doesn't have the `trace`, it means it's the native token.
  // Then returns the first asset because it's always the native token
  return assets[0];
};
