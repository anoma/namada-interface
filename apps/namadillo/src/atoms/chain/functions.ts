import { Parameters } from "@anomaorg/namada-indexer-client";
import { singleUnitDurationFromInterval } from "@namada/utils/helpers";

export const calculateUnbondingPeriod = (parameters: Parameters): string => {
  const unbondingPeriodInEpochs =
    Number(parameters.unbondingLength) +
    Number(parameters.pipelineLength) +
    // + 1 because we unbonding period starts from the next epoch
    1;
  const minEpochDuration = Number(parameters.minDuration);
  const minNumOfBlocks = Number(parameters.minNumOfBlocks);
  const epochSwitchBlocksDelay = Number(parameters.epochSwitchBlocksDelay);

  // Because epoch duration is in reality longer by epochSwitchBlocksDelay we have to account for that
  const timePerBlock = minEpochDuration / minNumOfBlocks;
  const realMinEpochDuration =
    minEpochDuration + timePerBlock * epochSwitchBlocksDelay;

  return singleUnitDurationFromInterval(
    0,
    unbondingPeriodInEpochs * realMinEpochDuration
  );
};
