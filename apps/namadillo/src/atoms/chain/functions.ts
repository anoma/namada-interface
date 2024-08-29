import { Parameters } from "@anomaorg/namada-indexer-client";
import { singleUnitDurationFromInterval } from "@namada/utils/helpers";

export const calculateUnbondingPeriod = (parameters: Parameters): string => {
  const unbondingPeriodInEpochs =
    Number(parameters.unbondingLength) +
    Number(parameters.pipelineLength) +
    // + 1 because we unbonding period starts from the next epoch
    1;
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
