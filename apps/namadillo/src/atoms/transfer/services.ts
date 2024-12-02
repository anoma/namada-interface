import {
  Account,
  ShieldedTransferMsgValue,
  ShieldedTransferProps,
  ShieldingTransferMsgValue,
  ShieldingTransferProps,
  TransparentTransferMsgValue,
  TransparentTransferProps,
  UnshieldingTransferMsgValue,
  UnshieldingTransferProps,
} from "@namada/types";
import { buildTxPair, TransactionPair } from "lib/query";
import { ChainSettings, GasConfig } from "types";
import { getSdkInstance } from "utils/sdk";

export const createTransparentTransferTx = async (
  chain: ChainSettings,
  account: Account,
  props: TransparentTransferMsgValue[],
  gasConfig: GasConfig,
  memo = ""
): Promise<TransactionPair<TransparentTransferProps> | undefined> => {
  const { tx } = await getSdkInstance();
  const transactionPairs = await buildTxPair(
    account,
    gasConfig,
    chain,
    props,
    tx.buildTransparentTransfer,
    props[0]?.data[0]?.source,
    memo
  );
  return transactionPairs;
};

export const createShieldedTransferTx = async (
  chain: ChainSettings,
  account: Account,
  props: ShieldedTransferMsgValue[],
  gasConfig: GasConfig,
  memo = ""
): Promise<TransactionPair<ShieldedTransferProps> | undefined> => {
  const { tx } = await getSdkInstance();
  const transactionPairs = await buildTxPair(
    account,
    gasConfig,
    chain,
    props,
    tx.buildShieldedTransfer,
    props[0]?.data[0]?.source,
    memo
  );
  return transactionPairs;
};

export const createShieldingTransferTx = async (
  chain: ChainSettings,
  account: Account,
  props: ShieldingTransferMsgValue[],
  gasConfig: GasConfig,
  memo = ""
): Promise<TransactionPair<ShieldingTransferProps> | undefined> => {
  const { tx } = await getSdkInstance();
  const transactionPairs = await buildTxPair(
    account,
    gasConfig,
    chain,
    props,
    tx.buildShieldingTransfer,
    props[0]?.data[0]?.source,
    memo
  );
  return transactionPairs;
};

export const createUnshieldingTransferTx = async (
  chain: ChainSettings,
  account: Account,
  props: UnshieldingTransferMsgValue[],
  gasConfig: GasConfig,
  memo = ""
): Promise<TransactionPair<UnshieldingTransferProps> | undefined> => {
  const { tx } = await getSdkInstance();
  const transactionPairs = await buildTxPair(
    account,
    gasConfig,
    chain,
    props,
    tx.buildUnshieldingTransfer,
    props[0]?.source,
    memo
  );
  return transactionPairs;
};
