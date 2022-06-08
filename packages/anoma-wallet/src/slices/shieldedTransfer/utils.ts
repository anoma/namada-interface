import { Config } from "config";
import { RpcClient } from "lib";
import { NodeWithNextId, MaspWeb } from "@anoma/masp-web";
import { TRANSFER_CONFIGURATION, TransactionConfiguration } from "./types";

const { network } = new Config();
const rpcClient = new RpcClient(network);

// created a shielded transfer that can be submitted to the ledger with a
// regular transaction
export const createShieldedTransfer = async (
  amount: number,
  inputAddress: string,
  outputAddress: string
): Promise<Uint8Array> => {
  try {
    const amountAsBigInt = BigInt(amount);
    const shieldedTransfer = await createShieldedTransferUsingTransfers(
      amountAsBigInt,
      inputAddress,
      outputAddress
    );
    return Promise.resolve(shieldedTransfer);
  } catch (error) {
    return Promise.reject(error);
  }
};

// gives a shielded balance of viewing key/spending key
export const getShieldedBalance = async (
  inputAddress: string
): Promise<string> => {
  try {
    const shieldedTransfer = await getShieldedBalanceUsingTransfers(
      inputAddress
    );
    return Promise.resolve(shieldedTransfer);
  } catch (error) {
    return Promise.reject(error);
  }
};

const getTransactionConfiguration = (): TransactionConfiguration => {
  return TRANSFER_CONFIGURATION;
};

// returns a transaction, nextTransaction tuple by transaction id
const fetchShieldedTransferById = async (
  transactionId?: string
): Promise<NodeWithNextId | undefined> => {
  const transactionConfiguration = getTransactionConfiguration();
  const { maspAddress } = transactionConfiguration;
  const shieldedTransactionId = await rpcClient.queryShieldedTransaction(
    maspAddress,
    transactionId
  );
  return Promise.resolve(shieldedTransactionId);
};

// we need all the previous shielded transfer as a starting point
// TODO these should be cached and not fetched always like now
// add the caching logic here so that they do not need to be fetched every time
const fetchShieldedTransfers = async (): Promise<NodeWithNextId[]> => {
  const transfers: NodeWithNextId[] = [];
  const headTransactionId = await fetchShieldedTransferById();
  if (headTransactionId) {
    transfers.push(headTransactionId);
  }
  let latestTransfer: NodeWithNextId = transfers[transfers.length - 1];
  while (latestTransfer.nextTransactionId) {
    const shieldedTransfer: NodeWithNextId | undefined =
      await fetchShieldedTransferById(latestTransfer.nextTransactionId);
    if (shieldedTransfer && shieldedTransfer.node) {
      transfers.push(shieldedTransfer);
    } else {
      break;
    }
    latestTransfer = transfers[transfers.length - 1];
  }
  return Promise.resolve(transfers);
};

// this augments the actual call with some common data that is not unique to the call
const createShieldedTransferUsingTransfers = async (
  amount: BigInt,
  inputAddress: string,
  outputAddress: string
): Promise<Uint8Array> => {
  const nodesWithNextId = await fetchShieldedTransfers();
  const maspWeb = await MaspWeb.init();
  const transactionConfiguration = getTransactionConfiguration();
  const shieldedTransaction = await maspWeb.generateShieldedTransaction(
    nodesWithNextId,
    amount,
    inputAddress,
    outputAddress,
    transactionConfiguration
  );
  return Promise.resolve(shieldedTransaction);
};

// this augments the actual call with some common data that is not unique to the call
const getShieldedBalanceUsingTransfers = async (
  inputAddress: string
): Promise<string> => {
  const nodesWithNextId = await fetchShieldedTransfers();
  const maspWeb = await MaspWeb.init();
  const transactionConfiguration = getTransactionConfiguration();

  const shieldedBalance = await maspWeb.getShieldedBalance(
    nodesWithNextId,
    inputAddress,
    transactionConfiguration
  );
  return Promise.resolve(shieldedBalance);
};
