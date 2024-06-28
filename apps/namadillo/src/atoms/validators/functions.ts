import {
  Bond as IndexerBond,
  Unbond as IndexerUnbond,
  Validator as IndexerValidator,
  VotingPower as IndexerVotingPower,
} from "@anomaorg/namada-indexer-client";
import { durationFromInterval } from "@namada/utils";
import BigNumber from "bignumber.js";
import { MyUnbondingValidator, MyValidator, Validator } from "types";

export const toValidator = (
  indexerValidator: IndexerValidator,
  indexerVotingPower: IndexerVotingPower,
  unbondingPeriod: bigint,
  nominalApr: BigNumber
): Validator => {
  const commission = BigNumber(indexerValidator.commission);
  const expectedApr = nominalApr.times(1 - commission.toNumber());

  return {
    uuid: indexerValidator.address,
    alias: indexerValidator.name,
    description: indexerValidator.description,
    address: indexerValidator.address,
    homepageUrl: indexerValidator.website,
    expectedApr,
    unbondingPeriod: `${unbondingPeriod} days`,
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
  unbondingPeriod: bigint,
  apr: BigNumber
): MyValidator[] => {
  return indexerBonds.map((indexerBond) => {
    const validator = toValidator(
      indexerBond.validator,
      totalVotingPower,
      unbondingPeriod,
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
  unbondingPeriod: bigint,
  apr: BigNumber
): MyUnbondingValidator[] => {
  const timeNow = Math.round(Date.now() / 1000);

  return indexerBonds.map((indexerUnbond) => {
    const validator = toValidator(
      indexerUnbond.validator,
      totalVotingPower,
      unbondingPeriod,
      apr
    );
    const withdrawTime = Number(indexerUnbond.withdrawTime);
    const secondsLeft = withdrawTime - timeNow;

    // TODO: later return from the backend
    const canWithdraw = secondsLeft <= 0;
    const timeLeft =
      canWithdraw ? "" : durationFromInterval(timeNow, withdrawTime);

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
