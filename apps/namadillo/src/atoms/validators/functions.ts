import {
  Bond as IndexerBond,
  Unbond as IndexerUnbond,
  Validator as IndexerValidator,
  VotingPower as IndexerVotingPower,
} from "@anomaorg/namada-indexer-client";
import { singleUnitDurationFromInterval } from "@namada/utils";
import BigNumber from "bignumber.js";
import { EpochInfo, MyUnbondingValidator, MyValidator, Validator } from "types";

export const toValidator = (
  indexerValidator: IndexerValidator,
  indexerVotingPower: IndexerVotingPower,
  epochInfo: EpochInfo,
  nominalApr: BigNumber
): Validator => {
  const commission = BigNumber(indexerValidator.commission);
  const expectedApr = nominalApr.times(1 - commission.toNumber());

  // Because epoch duration is in reality longer by epochSwitchBlocksDelay we have to account for that
  const timePerBlock = epochInfo.minEpochDuration / epochInfo.minNumOfBlocks;
  const realMinEpochDuration =
    epochInfo.minEpochDuration +
    timePerBlock * epochInfo.epochSwitchBlocksDelay;

  const unbondingPeriod = singleUnitDurationFromInterval(
    0,
    epochInfo.unbondingPeriodInEpochs * realMinEpochDuration
  );

  return {
    uuid: indexerValidator.address,
    alias: indexerValidator.name,
    description: indexerValidator.description,
    address: indexerValidator.address,
    homepageUrl: indexerValidator.website,
    expectedApr,
    unbondingPeriod,
    votingPowerInNAM: BigNumber(indexerValidator.votingPower),
    votingPowerPercentage:
      Number(indexerValidator.votingPower) /
      Number(indexerVotingPower.totalVotingPower),
    commission: BigNumber(indexerValidator.commission),
    imageUrl: indexerValidator.avatar,
  };
};

export const toMyValidators = (
  indexerBonds: IndexerBond[],
  totalVotingPower: IndexerVotingPower,
  epochInfo: EpochInfo,
  apr: BigNumber
): MyValidator[] => {
  return indexerBonds.map((indexerBond) => {
    const validator = toValidator(
      indexerBond.validator,
      totalVotingPower,
      epochInfo,
      apr
    );

    return {
      uuid: String(indexerBond.validator.validatorId),
      stakingStatus: "bonded",
      stakedAmount: BigNumber(indexerBond.amount),
      unbondedAmount: BigNumber(0),
      withdrawableAmount: BigNumber(0),
      validator,
    };
  });
};

export const toUnbondingValidators = (
  indexerBonds: IndexerUnbond[],
  totalVotingPower: IndexerVotingPower,
  epochInfo: EpochInfo,
  apr: BigNumber
): MyUnbondingValidator[] => {
  const timeNow = Math.round(Date.now() / 1000);

  return indexerBonds.map((indexerUnbond) => {
    const validator = toValidator(
      indexerUnbond.validator,
      totalVotingPower,
      epochInfo,
      apr
    );
    const withdrawTime = Number(indexerUnbond.withdrawTime);

    const canWithdraw = indexerUnbond.canWithdraw;
    const timeLeft =
      canWithdraw ? ""
        // If can't withdraw but estimation is incorrect display withdraw epoch
      : withdrawTime < timeNow ? `Epoch ${indexerUnbond.withdrawEpoch}`
      : singleUnitDurationFromInterval(timeNow, withdrawTime);

    const amountValue = BigNumber(indexerUnbond.amount);
    const amount = {
      [canWithdraw ? "withdrawableAmount" : "unbondedAmount"]: amountValue,
    };

    return {
      uuid: String(indexerUnbond.validator.validatorId),
      stakingStatus: "unbonded",
      stakedAmount: BigNumber(0),
      timeLeft,
      validator,
      ...amount,
    };
  });
};
