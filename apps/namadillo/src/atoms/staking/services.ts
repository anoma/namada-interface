import { DefaultApi, Reward } from "@anomaorg/namada-indexer-client";
import {
  Account,
  BondMsgValue,
  BondProps,
  ClaimRewardsMsgValue,
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
} from "types";
import { getStakingChangesParams } from "./functions";

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
