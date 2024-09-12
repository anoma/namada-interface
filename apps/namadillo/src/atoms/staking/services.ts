import { DefaultApi, Reward } from "@anomaorg/namada-indexer-client";
import {
  Account,
  BondMsgValue,
  BondProps,
  ClaimRewardsMsgValue,
  RedelegateMsgValue,
  UnbondMsgValue,
  WithdrawMsgValue,
  WithdrawProps,
} from "@namada/types";
import { getSdkInstance } from "hooks";
import { TransactionPair, buildTxPair } from "lib/query";
import { Address, ChainSettings, GasConfig } from "types";

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
