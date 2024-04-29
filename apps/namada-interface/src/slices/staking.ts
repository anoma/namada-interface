import { getIntegration } from "@namada/integrations";
import { Account, BondProps, Chain, Signer, TxMsgValue } from "@namada/types";
import BigNumber from "bignumber.js";
import { invariant } from "framer-motion";
import { atomWithMutation, atomWithQuery } from "jotai-tanstack-query";
import { GasConfig } from "types/fees";
import { ChangeInStakingPosition } from "types/staking";
import { chainAtom } from "./chain";
import { MyValidator, myValidatorsAtom } from "./validators";

type StakingTotals = {
  totalBonded: BigNumber;
  totalUnbonded: BigNumber;
  totalWithdrawable: BigNumber;
};

type ChangeInStakingProps = {
  account: Account;
  changes: ChangeInStakingPosition[];
  gasConfig: GasConfig;
};

export const getStakingTotalAtom = atomWithQuery<StakingTotals>((get) => {
  const myValidators = get(myValidatorsAtom);
  return {
    enabled: myValidators.isSuccess,
    queryKey: ["staking-totals", myValidators.dataUpdatedAt],
    queryFn: async () => {
      const totalBonded = myValidators.data.reduce(
        (acc: BigNumber, validator: MyValidator) =>
          acc.plus(validator.stakedAmount ?? 0),
        new BigNumber(0)
      );

      const totalUnbonded = myValidators.data.reduce(
        (acc: BigNumber, validator: MyValidator) =>
          acc.plus(validator.unbondedAmount ?? 0),
        new BigNumber(0)
      );

      const totalWithdrawable = myValidators.data.reduce(
        (acc: BigNumber, validator: MyValidator) =>
          acc.plus(validator.withdrawableAmount ?? 0),
        new BigNumber(0)
      );

      return { totalBonded, totalUnbonded, totalWithdrawable };
    },
  };
});

const getStakingChangesParams = (
  account: Account,
  changes: ChangeInStakingPosition[],
  chain: Chain
): BondProps[] => {
  const address = chain.currency.address;
  invariant(!!address, "Invalid currency address");
  return changes.map((change) => ({
    source: account.address,
    validator: change.validatorId,
    amount: change.amount,
    nativeToken: address!,
  }));
};

const getTxProps = (
  account: Account,
  gasConfig: GasConfig,
  chain: Chain
): TxMsgValue => {
  const address = chain.currency.address;
  invariant(!!address, "Invalid currency address");
  invariant(
    !!account.publicKey,
    "Account doesn't contain a publicKey attached to it"
  );

  return {
    token: address!,
    feeAmount: gasConfig.gasPrice,
    gasLimit: gasConfig.gasLimit,
    chainId: chain.chainId,
    publicKey: account.publicKey!,
    memo: "",
  };
};

export const performBondAtom = atomWithMutation((get) => {
  return {
    mutationKey: ["bonding"],
    mutationFn: async ({
      changes,
      gasConfig,
      account,
    }: ChangeInStakingProps) => {
      const chain = get(chainAtom);
      const integration = getIntegration(chain.id);
      const signer = integration.signer() as Signer;
      return await signer.submitBond(
        getStakingChangesParams(account, changes, chain),
        getTxProps(account, gasConfig, chain),
        account.type
      );
    },
  };
});

export const performUnbondAtom = atomWithMutation((get) => {
  return {
    mutationKey: ["unbonding"],
    mutationFn: async ({
      changes,
      gasConfig,
      account,
    }: ChangeInStakingProps) => {
      const chain = get(chainAtom);
      const integration = getIntegration(chain.id);
      const signer = integration.signer() as Signer;
      await signer.submitUnbond(
        getStakingChangesParams(account, changes, chain),
        getTxProps(account, gasConfig, chain),
        account.type
      );
    },
  };
});

export const performUnstakeAtom = atomWithMutation((get) => {
  return {
    mutationKey: ["unstake"],
    mutationFn: async ({
      changes,
      gasConfig,
      account,
    }: ChangeInStakingProps) => {
      const chain = get(chainAtom);
      const integration = getIntegration(chain.id);
      const signer = integration.signer() as Signer;
      await signer.submitWithdraw(
        getStakingChangesParams(account, changes, chain),
        getTxProps(account, gasConfig, chain),
        account.type
      );
    },
  };
});
