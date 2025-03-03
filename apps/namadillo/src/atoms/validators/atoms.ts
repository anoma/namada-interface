import { defaultAccountAtom } from "atoms/accounts";
import { indexerApiAtom } from "atoms/api";
import { chainParametersAtom } from "atoms/chain";
import { shouldUpdateBalanceAtom } from "atoms/etc";
import { queryDependentFn } from "atoms/utils";
import BigNumber from "bignumber.js";
import { atomWithQuery } from "jotai-tanstack-query";
import { MyValidator, Validator, ValidatorWithMSR } from "types";
import { toMyValidators } from "./functions";
import {
  fetchAllValidators,
  fetchMyBondedAmounts,
  fetchMyUnbondedAmounts,
  fetchVotingPower,
} from "./services";

export const votingPowerAtom = atomWithQuery((get) => {
  const api = get(indexerApiAtom);
  return {
    queryKey: ["voting-power"],
    queryFn: () => fetchVotingPower(api),
  };
});

export const allValidatorsAtom = atomWithQuery((get) => {
  const chainParameters = get(chainParametersAtom);
  const votingPower = get(votingPowerAtom);
  const api = get(indexerApiAtom);
  return {
    queryKey: ["all-validators"],
    ...queryDependentFn(async (): Promise<Validator[]> => {
      return fetchAllValidators(api, chainParameters.data!, votingPower.data!);
    }, [chainParameters, votingPower]),
  };
});

export const allValidatorsWithMSRAtom = atomWithQuery((get) => {
  const validators = get(allValidatorsAtom);
  const totalVotingPower = get(votingPowerAtom);
  const params = get(chainParametersAtom);

  return {
    queryKey: ["all-validators"],
    ...queryDependentFn(async (): Promise<ValidatorWithMSR[]> => {
      const { duplicateVoteMinSlashRate, lightClientAttackMinSlashRate } =
        params.data!;
      const minSlashRateParam = BigNumber.min(
        duplicateVoteMinSlashRate,
        lightClientAttackMinSlashRate
      );

      return validators.data!.map((v) => {
        const votingPower = BigNumber(v.votingPowerInNAM || 0);
        const slashRateParam = BigNumber(9).times(
          votingPower.div(totalVotingPower.data!.totalVotingPower).pow(2)
        );

        // Slash rate should not exceed 100%
        const minSlashRate = BigNumber.min(
          BigNumber(1),
          BigNumber.max(minSlashRateParam, slashRateParam)
        );

        return { ...v, msr: minSlashRate };
      });
    }, [validators, params, totalVotingPower]),
  };
});

// eslint-disable-next-line
export const myValidatorsAtom = atomWithQuery((get) => {
  const account = get(defaultAccountAtom);
  const chainParameters = get(chainParametersAtom);
  const votingPower = get(votingPowerAtom);
  const api = get(indexerApiAtom);

  // TODO: Refactor after this event subscription is enabled in the indexer
  const enablePolling = get(shouldUpdateBalanceAtom);
  return {
    queryKey: ["my-validators", account.data?.address],
    refetchInterval: enablePolling ? 1000 : false,
    ...queryDependentFn(async (): Promise<MyValidator[]> => {
      const bondedAmountsQuery = fetchMyBondedAmounts(api, account.data!);
      const unbondedAmountsQuery = fetchMyUnbondedAmounts(api, account.data!);
      const [unbondedAmounts, bondedAmounts] = await Promise.all([
        unbondedAmountsQuery,
        bondedAmountsQuery,
      ]);
      return toMyValidators(
        bondedAmounts,
        unbondedAmounts,
        votingPower.data!,
        chainParameters.data!.unbondingPeriod,
        chainParameters.data!.apr
      );
    }, [account, chainParameters, votingPower]),
  };
});
