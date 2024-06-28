import { WithdrawProps } from "@namada/types";
import { chainAtom } from "atoms/chain";
import { queryDependentFn } from "atoms/utils";
import { myValidatorsAtom } from "atoms/validators";
import { atomWithMutation, atomWithQuery } from "jotai-tanstack-query";
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
    mutationFn: async ({ changes, gasConfig, account }: ChangeInStakingProps) =>
      createBondTx(chain.data!, account, changes, gasConfig),
  };
});

export const createUnbondTxAtom = atomWithMutation((get) => {
  const chain = get(chainAtom);
  return {
    mutationKey: ["create-unbonding-tx"],
    enabled: chain.isSuccess,
    mutationFn: async ({ changes, gasConfig, account }: ChangeInStakingProps) =>
      createUnbondTx(chain.data!, account, changes, gasConfig),
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
    }: RedelegateChangesProps) =>
      createReDelegateTx(chain.data!, account, changes, gasConfig),
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
    }: ChangeInStakingProps): Promise<
      TransactionPair<WithdrawProps>[] | undefined
    > => createWithdrawTx(chain.data!, account, changes, gasConfig),
  };
});
