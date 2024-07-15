import { BondProps, WithdrawProps } from "@namada/types";
import { chainAtom } from "atoms/chain";
import { queryDependentFn } from "atoms/utils";
import { myValidatorsAtom } from "atoms/validators";
import { atomWithMutation, atomWithQuery } from "jotai-tanstack-query";
import { atomFamily } from "jotai/utils";
import { TransactionPair } from "lib/query";
import {
  ChangeInStakingProps,
  RedelegateChangesProps,
  StakingTotals,
} from "types";
import { toStakingTotal } from "./functions";
import {
  createBondTx,
  createReDelegateTx,
  createUnbondTx,
  createWithdrawTx,
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
      changes,
      gasConfig,
      account,
      checksums,
    }: ChangeInStakingProps) =>
      createBondTx(chain.data!, account, changes, gasConfig, checksums),
  };
});

export const createUnbondTxAtom = atomWithMutation((get) => {
  const chain = get(chainAtom);
  return {
    mutationKey: ["create-unbonding-tx"],
    enabled: chain.isSuccess,
    mutationFn: async ({
      changes,
      gasConfig,
      account,
      checksums,
    }: ChangeInStakingProps) =>
      createUnbondTx(chain.data!, account, changes, gasConfig, checksums),
  };
});

export const createReDelegateTxAtom = atomWithMutation((get) => {
  const chain = get(chainAtom);
  return {
    mutationKey: ["create-redelegate-tx"],
    enabled: chain.isSuccess,
    mutationFn: async ({
      changes,
      gasConfig,
      account,
      checksums,
    }: RedelegateChangesProps) =>
      createReDelegateTx(chain.data!, account, changes, gasConfig, checksums),
  };
});

export const createWithdrawTxAtom = atomWithMutation((get) => {
  const chain = get(chainAtom);
  return {
    mutationKey: ["create-withdraw-tx"],
    enabled: chain.isSuccess,
    mutationFn: async ({
      changes,
      gasConfig,
      account,
      checksums,
    }: ChangeInStakingProps): Promise<
      [TransactionPair<WithdrawProps>, BondProps] | undefined
    > => createWithdrawTx(chain.data!, account, changes, gasConfig, checksums),
  };
});

export const createWithdrawTxAtomFamily = atomFamily((id: string) => {
  return atomWithMutation((get) => {
    const chain = get(chainAtom);
    return {
      mutationKey: ["create-withdraw-tx", id],
      enabled: chain.isSuccess,
      mutationFn: async ({
        changes,
        gasConfig,
        account,
        checksums,
      }: ChangeInStakingProps): Promise<
        [TransactionPair<WithdrawProps>, BondProps] | undefined
      > =>
        createWithdrawTx(chain.data!, account, changes, gasConfig, checksums),
    };
  });
});
