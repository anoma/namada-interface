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
  const nominalApr = chainParameters.apr;
  const validatorsResponse = await api.apiV1PosValidatorAllGet([
    IndexerValidatorStatus.Consensus,
  ]);

  const validators = validatorsResponse.data;
  return validators.map((v) =>
    toValidator(v, votingPower, chainParameters.unbondingPeriod, nominalApr)
  );
};

export const fetchMyValidators = async (
  api: DefaultApi,
  account: Account,
  chainParameters: ChainParameters,
  votingPower: IndexerVotingPower
): Promise<MyValidator[]> => {
  const apr = chainParameters.apr;
  const bondsResponse = await api.apiV1PosMergedBondsAddressGet(
    account.address
  );
  return toMyValidators(
    bondsResponse.data.results,
    votingPower,
    chainParameters.unbondingPeriod,
    apr
  );
};

export const fetchMyUnbonds = async (
  api: DefaultApi,
  account: Account,
  chainParameters: ChainParameters,
  votingPower: IndexerVotingPower
): Promise<MyUnbondingValidator[]> => {
  const apr = chainParameters.apr;
  const unbondsResponse = await api.apiV1PosMergedUnbondsAddressGet(
    account.address
  );
  return toUnbondingValidators(
    unbondsResponse.data.results,
    votingPower,
    chainParameters.unbondingPeriod,
    apr
  );
};
