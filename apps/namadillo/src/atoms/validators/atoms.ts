import { defaultAccountAtom } from "atoms/accounts";
import { indexerApiAtom } from "atoms/api";
import { chainParametersAtom } from "atoms/chain";
import { shouldUpdateBalanceAtom } from "atoms/etc";
import { queryDependentFn } from "atoms/utils";
import BigNumber from "bignumber.js";
import {
  AtomWithQueryResult,
  UndefinedInitialDataOptions,
  atomWithQuery,
} from "jotai-tanstack-query";
import { MyUnbondingValidator, MyValidator, Validator } from "types";
import {
  fetchAllValidators,
  fetchMyUnbonds,
  fetchMyValidators,
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
    ...queryDependentFn(
      async (): Promise<Validator[]> =>
        fetchAllValidators(api, chainParameters.data!, votingPower.data!),
      [chainParameters, votingPower]
    ),
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
    ...queryDependentFn(
      async (): Promise<MyValidator[]> =>
        fetchMyValidators(
          api,
          account.data!,
          chainParameters.data!,
          votingPower.data!
        ),
      [account, chainParameters, votingPower]
    ),
  };
});

export const myUnbondsAtom = atomWithQuery<MyUnbondingValidator[]>((get) => {
  const chainParameters = get(chainParametersAtom);
  const account = get(defaultAccountAtom);
  const votingPower = get(votingPowerAtom);
  const api = get(indexerApiAtom);

  // TODO: Refactor after this event subscription is enabled in the indexer
  const enablePolling = get(shouldUpdateBalanceAtom);
  return {
    queryKey: ["my-unbonds", account.data?.address],
    refetchInterval: enablePolling ? 1000 : false,
    ...queryDependentFn(
      async (): Promise<MyUnbondingValidator[]> =>
        fetchMyUnbonds(
          api,
          account.data!,
          chainParameters.data!,
          votingPower.data!
        ),
      [account, chainParameters, votingPower]
    ),
  };
});

export const unbondedAmountByAddressAtom = atomWithQuery((get) =>
  deriveFromMyValidatorsAtom(
    "unbonded-amount",
    "unbondedAmount",
    get(myUnbondsAtom)
  )
);

export const withdrawableAmountByAddressAtom = atomWithQuery((get) =>
  deriveFromMyValidatorsAtom(
    "withdrawable-amount",
    "withdrawableAmount",
    get(myValidatorsAtom)
  )
);

export const stakedAmountByAddressAtom = atomWithQuery((get) =>
  deriveFromMyValidatorsAtom(
    "staked-amount",
    "stakedAmount",
    get(myValidatorsAtom)
  )
);

const deriveFromMyValidatorsAtom = (
  key: string,
  property: "stakedAmount" | "unbondedAmount" | "withdrawableAmount",
  myValidators: AtomWithQueryResult<
    (MyValidator | MyUnbondingValidator)[],
    Error
  >
): UndefinedInitialDataOptions<Record<string, BigNumber>> => {
  return {
    queryKey: [key, myValidators.data],
    enabled: myValidators.isSuccess,
    queryFn: async () => {
      return myValidators.data!.reduce((prev, current) => {
        if (current[property]?.gt(0)) {
          return { ...prev, [current.validator.address]: current[property] };
        }
        return prev;
      }, {});
    },
  };
};
