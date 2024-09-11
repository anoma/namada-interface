import { DefaultApi, Reward } from "@anomaorg/namada-indexer-client";
import {
  Account,
  BondProps,
  RedelegateMsgValue,
  UnbondMsgValue,
  WithdrawProps,
} from "@namada/types";
import { getSdkInstance } from "hooks";
import { TransactionPair, buildTxPair } from "lib/query";
import {
  Address,
  ChainSettings,
  ChangeInStakingPosition,
  GasConfig,
  RedelegateChange,
} from "types";
import {
  getRedelegateChangeParams,
  getStakingChangesParams,
} from "./functions";

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
  changes: ChangeInStakingPosition[],
  gasConfig: GasConfig
): Promise<TransactionPair<BondProps> | undefined> => {
  const { tx } = await getSdkInstance();
  const bondProps = getStakingChangesParams(
    account,
    chain.nativeTokenAddress,
    changes
  );
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
  changes: ChangeInStakingPosition[],
  gasConfig: GasConfig
): Promise<TransactionPair<UnbondMsgValue>> => {
  const { tx } = await getSdkInstance();
  const unbondProps = getStakingChangesParams(
    account,
    chain.nativeTokenAddress,
    changes
  );
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
  changes: RedelegateChange[],
  gasConfig: GasConfig
): Promise<TransactionPair<RedelegateMsgValue>> => {
  const { tx } = await getSdkInstance();
  const redelegateProps = getRedelegateChangeParams(account, changes);
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
  changes: ChangeInStakingPosition[],
  gasConfig: GasConfig
): Promise<[TransactionPair<WithdrawProps>, BondProps] | undefined> => {
  const { tx } = await getSdkInstance();
  const withdrawProps = getStakingChangesParams(
    account,
    chain.nativeTokenAddress,
    changes
  );
  const transactionPair = await buildTxPair(
    account,
    gasConfig,
    chain,
    withdrawProps,
    tx.buildWithdraw,
    withdrawProps[0].source
  );

  return [transactionPair, withdrawProps[0]];
};
