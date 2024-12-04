import { DefaultApi, Reward } from "@namada/indexer-client";
import {
  Account,
  BondMsgValue,
  BondProps,
  ClaimRewardsMsgValue,
  ClaimRewardsProps,
  RedelegateMsgValue,
  TxMsgValue,
  UnbondMsgValue,
  WithdrawMsgValue,
  WithdrawProps,
  WrapperTxProps,
} from "@namada/types";
import { queryClient } from "App/Common/QueryProvider";
import { TransactionPair, buildTxPair } from "lib/query";
import { Address, AddressBalance, ChainSettings, GasConfig } from "types";
import { getSdkInstance } from "utils/sdk";

export const fetchClaimableRewards = async (
  api: DefaultApi,
  address: Address
): Promise<Reward[]> => {
  const response = await api.apiV1PosRewardAddressGet(address);
  return response.data;
};

export const createBondTx = async (
  chain: ChainSettings,
  account: Account,
  bondProps: BondMsgValue[],
  gasConfig: GasConfig
): Promise<TransactionPair<BondProps> | undefined> => {
  const { tx } = await getSdkInstance();
  const transactionPairs = await buildTxPair(
    account,
    gasConfig,
    chain,
    bondProps,
    tx.buildBond,
    bondProps[0].source
  );
  return transactionPairs;
};

export const createUnbondTx = async (
  chain: ChainSettings,
  account: Account,
  unbondProps: UnbondMsgValue[],
  gasConfig: GasConfig
): Promise<TransactionPair<UnbondMsgValue>> => {
  const { tx } = await getSdkInstance();
  const transactionPairs = await buildTxPair(
    account,
    gasConfig,
    chain,
    unbondProps,
    tx.buildUnbond,
    unbondProps[0].source
  );
  return transactionPairs;
};

export const createReDelegateTx = async (
  chain: ChainSettings,
  account: Account,
  redelegateProps: RedelegateMsgValue[],
  gasConfig: GasConfig
): Promise<TransactionPair<RedelegateMsgValue>> => {
  const { tx } = await getSdkInstance();
  const transactionPairs = await buildTxPair(
    account,
    gasConfig,
    chain,
    redelegateProps,
    tx.buildRedelegate,
    redelegateProps[0].owner
  );
  return transactionPairs;
};

export const createWithdrawTx = async (
  chain: ChainSettings,
  account: Account,
  withdrawProps: WithdrawMsgValue[],
  gasConfig: GasConfig
): Promise<TransactionPair<WithdrawProps>> => {
  const { tx } = await getSdkInstance();
  const transactionPair = await buildTxPair(
    account,
    gasConfig,
    chain,
    withdrawProps,
    tx.buildWithdraw,
    withdrawProps[0].source
  );
  return transactionPair;
};

export const createClaimTx = async (
  chain: ChainSettings,
  account: Account,
  params: ClaimRewardsMsgValue[],
  gasConfig: GasConfig
): Promise<TransactionPair<ClaimRewardsMsgValue>> => {
  const { tx } = await getSdkInstance();
  return await buildTxPair(
    account,
    gasConfig,
    chain,
    params,
    tx.buildClaimRewards,
    account.address
  );
};

export const createClaimAndStakeTx = async (
  chain: ChainSettings,
  account: Account,
  params: ClaimRewardsMsgValue[],
  claimableRewardsByValidator: AddressBalance,
  gasConfig: GasConfig
): Promise<TransactionPair<ClaimRewardsMsgValue>> => {
  const { tx } = await getSdkInstance();

  // BuildTx wrapper to handle different commitment types
  const buildClaimRewardsAndStake = async (
    wrapperTxProps: WrapperTxProps,
    props: ClaimRewardsProps | BondProps
  ): Promise<TxMsgValue> => {
    if ("amount" in props) {
      // We have to force it in case: current balance < rewards to claim
      // This will still log the error msg in the terminal, unfortunately we can't do much about it
      wrapperTxProps.force = true;
      return tx.buildBond(wrapperTxProps, props as BondProps);
    } else {
      return tx.buildClaimRewards(wrapperTxProps, props as ClaimRewardsProps);
    }
  };

  // Adding bonding commitments after the claiming ones. Order is strictly
  // important in this case
  const claimAndStakingParams: (ClaimRewardsMsgValue | BondMsgValue)[] =
    Array.from(params);

  params.forEach((claimParam) => {
    const { validator, source } = claimParam;
    if (claimableRewardsByValidator.hasOwnProperty(validator)) {
      claimAndStakingParams.push({
        amount: claimableRewardsByValidator[validator],
        source,
        validator,
      } as BondMsgValue);
    }
  });

  return await buildTxPair(
    account,
    gasConfig,
    chain,
    claimAndStakingParams,
    buildClaimRewardsAndStake,
    account.address
  );
};

export const clearClaimRewards = (accountAddress: string): void => {
  const emptyClaimRewards = {};
  queryClient.setQueryData(
    ["claim-rewards", accountAddress],
    () => emptyClaimRewards
  );
};
