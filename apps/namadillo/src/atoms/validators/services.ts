import {
  DefaultApi,
  ValidatorStatus as IndexerValidatorStatus,
  VotingPower as IndexerVotingPower,
  VotingPower,
} from "@anomaorg/namada-indexer-client";
import { Account } from "@namada/types";
import {
  ChainParameters,
  MyUnbondingValidator,
  MyValidator,
  Validator,
} from "types";
import {
  toMyValidators,
  toUnbondingValidators,
  toValidator,
} from "./functions";

export const fetchVotingPower = async (
  api: DefaultApi
): Promise<VotingPower> => {
  const response = await api.apiV1PosVotingPowerGet();
  return response.data;
};

export const fetchAllValidators = async (
  api: DefaultApi,
  chainParameters: ChainParameters,
  votingPower: IndexerVotingPower
): Promise<Validator[]> => {
  const unbondingPeriodInDays = chainParameters.unbondingPeriodInDays;
  const nominalApr = chainParameters.apr;
  const validatorsResponse = await api.apiV1PosValidatorGet(1, [
    IndexerValidatorStatus.Consensus,
  ]);

  // TODO: rename one data to items?
  const validators = validatorsResponse.data.data;
  return validators.map((v) =>
    toValidator(v, votingPower, unbondingPeriodInDays, nominalApr)
  );
};

export const fetchMyValidators = async (
  api: DefaultApi,
  account: Account,
  chainParameters: ChainParameters,
  votingPower: IndexerVotingPower
): Promise<MyValidator[]> => {
  const unbondingPeriod = chainParameters.unbondingPeriodInDays;
  const apr = chainParameters.apr;
  const bondsResponse = await api.apiV1PosBondAddressGet(account.address);
  return toMyValidators(
    bondsResponse.data.data,
    votingPower,
    unbondingPeriod,
    apr
  );
};

export const fetchMyUnbonds = async (
  api: DefaultApi,
  account: Account,
  chainParameters: ChainParameters,
  votingPower: IndexerVotingPower
): Promise<MyUnbondingValidator[]> => {
  const unbondingPeriod = chainParameters.unbondingPeriodInDays;
  const apr = chainParameters.apr;
  const unbondsResponse = await api.apiV1PosUnbondAddressGet(account.address);
  return toUnbondingValidators(
    unbondsResponse.data.data,
    votingPower,
    unbondingPeriod,
    apr
  );
};
