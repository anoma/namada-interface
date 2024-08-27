import {
  Bond as IndexerBond,
  Unbond as IndexerUnbond,
  Validator as IndexerValidator,
  VotingPower as IndexerVotingPower,
} from "@anomaorg/namada-indexer-client";
import { singleUnitDurationFromInterval } from "@namada/utils";
import BigNumber from "bignumber.js";
import {
  Address,
  EpochInfo,
  MyValidator,
  UnbondingValidator,
  Validator,
} from "types";

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

export const calculateUnbondingTimeLeft = (unbond: IndexerUnbond): string => {
  const timeNow = Math.round(Date.now() / 1000);
  const withdrawTime = Number(unbond.withdrawTime);
  const canWithdraw = unbond.canWithdraw;
  const timeLeft =
    canWithdraw ? ""
      // If can't withdraw but estimation is incorrect display withdraw epoch
    : withdrawTime < timeNow ? `Epoch ${unbond.withdrawEpoch}`
    : singleUnitDurationFromInterval(timeNow, withdrawTime);
  return timeLeft;
};

export const toMyValidators = (
  indexerBonds: IndexerBond[],
  indexerUnbonds: IndexerUnbond[],
  totalVotingPower: IndexerVotingPower,
  epochInfo: EpochInfo,
  apr: BigNumber
): MyValidator[] => {
  const myValidators: Record<Address, MyValidator> = {};

  const createEntryIfDoesntExist = (validator: IndexerValidator): void => {
    if (!myValidators.hasOwnProperty(validator.address)) {
      myValidators[validator.address] = {
        withdrawableAmount: new BigNumber(0),
        stakedAmount: new BigNumber(0),
        unbondedAmount: new BigNumber(0),
        bondItems: [],
        unbondingItems: [],
        withdrawableItems: [],
        validator: toValidator(validator, totalVotingPower, epochInfo, apr),
      };
    }
  };

  const addBondToAddress = (
    address: Address,
    key: "bondItems" | "unbondingItems" | "withdrawableItems",
    bond: IndexerBond | IndexerUnbond
  ): void => {
    const { validator: _, ...bondsWithoutValidator } = bond;
    myValidators[address]![key].push(bondsWithoutValidator);
  };

  const incrementAmount = (
    address: Address,
    prop: keyof Pick<
      MyValidator,
      "stakedAmount" | "withdrawableAmount" | "unbondedAmount"
    >,
    amount: BigNumber | string
  ): void => {
    myValidators[address][prop] = myValidators[address][prop]!.plus(amount);
  };

  for (const bond of indexerBonds) {
    const { address } = bond.validator;
    createEntryIfDoesntExist(bond.validator);
    incrementAmount(address, "stakedAmount", bond.amount);
    addBondToAddress(address, "bondItems", { ...bond });
  }

  for (const unbond of indexerUnbonds) {
    const { address } = unbond.validator;
    const unbondingDetails: UnbondingValidator = {
      ...unbond,
      timeLeft: calculateUnbondingTimeLeft(unbond),
    };
    if (unbond.canWithdraw) {
      addBondToAddress(address, "withdrawableItems", unbondingDetails);
      incrementAmount(address, "withdrawableAmount", unbond.amount);
    } else {
      addBondToAddress(address, "unbondingItems", unbondingDetails);
      incrementAmount(address, "unbondedAmount", unbond.amount);
    }
  }

  return Object.values(myValidators);
};
