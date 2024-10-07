import { Reward } from "@anomaorg/namada-indexer-client";
import {
  BondMsgValue,
  ClaimRewardsMsgValue,
  RedelegateMsgValue,
  UnbondMsgValue,
  WithdrawMsgValue,
} from "@namada/types";
import { defaultAccountAtom } from "atoms/accounts";
import { indexerApiAtom } from "atoms/api";
import { chainAtom, chainParametersAtom } from "atoms/chain";
import { queryDependentFn } from "atoms/utils";
import { myValidatorsAtom } from "atoms/validators";
import BigNumber from "bignumber.js";
import { atomWithMutation, atomWithQuery } from "jotai-tanstack-query";
import { atomFamily } from "jotai/utils";
import { AddressBalance, BuildTxAtomParams, StakingTotals } from "types";
import { toStakingTotal } from "./functions";
import {
  createBondTx,
  createClaimAndStakeTx,
  createClaimTx,
  createReDelegateTx,
  createUnbondTx,
  createWithdrawTx,
  fetchClaimableRewards,
} from "./services";

export const getStakingTotalAtom = atomWithQuery<StakingTotals>((get) => {
  const myValidators = get(myValidatorsAtom);
  return {
    queryKey: ["staking-totals", myValidators.dataUpdatedAt],
    ...queryDependentFn(
      async (): Promise<StakingTotals> =>
        toStakingTotal(myValidators.data || []),
      [myValidators]
    ),
  };
});

export const createBondTxAtom = atomWithMutation((get) => {
  const chain = get(chainAtom);
  return {
    mutationKey: ["create-bonding-tx"],
    enabled: chain.isSuccess,
    mutationFn: async ({
      params,
      gasConfig,
      account,
    }: BuildTxAtomParams<BondMsgValue>) =>
      createBondTx(chain.data!, account, params, gasConfig),
  };
});

export const createUnbondTxAtom = atomWithMutation((get) => {
  const chain = get(chainAtom);
  return {
    mutationKey: ["create-unbonding-tx"],
    enabled: chain.isSuccess,
    mutationFn: async ({
      params,
      gasConfig,
      account,
    }: BuildTxAtomParams<UnbondMsgValue>) =>
      createUnbondTx(chain.data!, account, params, gasConfig),
  };
});

export const createReDelegateTxAtom = atomWithMutation((get) => {
  const chain = get(chainAtom);
  return {
    mutationKey: ["create-redelegate-tx"],
    enabled: chain.isSuccess,
    mutationFn: async ({
      params,
      gasConfig,
      account,
    }: BuildTxAtomParams<RedelegateMsgValue>) =>
      createReDelegateTx(chain.data!, account, params, gasConfig),
  };
});

export const createWithdrawTxAtomFamily = atomFamily((id: string) => {
  return atomWithMutation((get) => {
    const chain = get(chainAtom);
    return {
      mutationKey: ["create-withdraw-tx", id],
      enabled: chain.isSuccess,
      mutationFn: async ({
        params,
        gasConfig,
        account,
      }: BuildTxAtomParams<WithdrawMsgValue>) =>
        createWithdrawTx(chain.data!, account, params, gasConfig),
    };
  });
});

export const claimableRewardsAtom = atomWithQuery<AddressBalance>((get) => {
  const account = get(defaultAccountAtom);
  const chainParameters = get(chainParametersAtom);
  const api = get(indexerApiAtom);
  return {
    queryKey: ["claim-rewards", account.data?.address],
    refetchInterval: 60 * 1000,
    ...queryDependentFn(async () => {
      const rewards = await fetchClaimableRewards(api, account.data!.address);
      return rewards.reduce(
        (prev: AddressBalance, current: Reward): AddressBalance => {
          if (!current.validator) return prev;
          return {
            ...prev,
            [current.validator?.address]: new BigNumber(current.amount || 0),
          };
        },
        {}
      );
    }, [account, chainParameters]),
  };
});

export const claimRewardsAtom = atomWithMutation((get) => {
  const chain = get(chainAtom);
  return {
    mutationKey: ["create-claim-tx"],
    enabled: chain.isSuccess,
    mutationFn: async ({
      params,
      gasConfig,
      account,
    }: BuildTxAtomParams<ClaimRewardsMsgValue>) => {
      return createClaimTx(chain.data!, account, params, gasConfig);
    },
  };
});

export const claimAndStakeRewardsAtom = atomWithMutation((get) => {
  const chain = get(chainAtom);
  const claimableRewards = get(claimableRewardsAtom);
  return {
    mutationKey: ["create-claim-and-stake-tx"],
    enabled: chain.isSuccess && claimableRewards.isSuccess,
    mutationFn: async ({
      params,
      gasConfig,
      account,
    }: BuildTxAtomParams<ClaimRewardsMsgValue>) => {
      return createClaimAndStakeTx(
        chain.data!,
        account,
        params,
        claimableRewards.data!,
        gasConfig
      );
    },
  };
});
