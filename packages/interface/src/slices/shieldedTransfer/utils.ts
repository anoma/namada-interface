import Config from "config";
import { RpcClient } from "lib";
import { NodeWithNextId, getMaspWeb } from "@anoma/masp-web";
import { TRANSFER_CONFIGURATION } from "./types";

// created a shielded transfer that can be submitted to the ledger with a
// regular transaction
export const createShieldedTransfer = async (
  chainId: string,
  amount: number,
  inputAddress: string | undefined,
  outputAddress: string,
  tokenAddress: string
): Promise<Uint8Array> => {
  try {
    const amountAsBigInt = BigInt(amount);
    const shieldedTransfer = await createShieldedTransferUsingTransfers(
      chainId,
      amountAsBigInt,
      inputAddress,
      outputAddress,
      tokenAddress
    );
    return Promise.resolve(shieldedTransfer);
  } catch (error) {
    return Promise.reject(error);
  }
};

// gives a shielded balance of viewing key/spending key
export const getShieldedBalance = async (
  chainId: string,
  inputAddress: string,
  tokenAddress: string
): Promise<string> => {
  try {
    const shieldedTransfer = await getShieldedBalanceUsingTransfers(
      chainId,
      inputAddress,
      tokenAddress
    );
    return Promise.resolve(shieldedTransfer);
  } catch (error) {
    return Promise.reject(error);
  }
};

// returns a transaction, nextTransaction tuple by transaction id
const fetchShieldedTransferById = async (
  chainId: string,
  transactionId?: string
): Promise<NodeWithNextId | undefined> => {
  const { maspAddress } = TRANSFER_CONFIGURATION;
  const { network } = Config.chain[chainId];

  const rpcClient = new RpcClient(network);
  const shieldedTransactionId = await rpcClient.queryShieldedTransaction(
    maspAddress,
    transactionId
  );
  return Promise.resolve(shieldedTransactionId);
};

// we need all the previous shielded transfer as a starting point
// TODO these should be cached and not fetched always like now
// add the caching logic here so that they do not need to be fetched every time
const fetchShieldedTransfers = async (
  chainId: string
): Promise<NodeWithNextId[]> => {
  const transfers: NodeWithNextId[] = [];
  const headTransactionId = await fetchShieldedTransferById(chainId);
  if (headTransactionId) {
    transfers.push(headTransactionId);
  }
  let latestTransfer: NodeWithNextId = transfers[transfers.length - 1];
  while (latestTransfer && latestTransfer.nextTransactionId) {
    const shieldedTransfer: NodeWithNextId | undefined =
      await fetchShieldedTransferById(
        chainId,
        latestTransfer.nextTransactionId
      );
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
  chainId: string,
  amount: bigint,
  inputAddress: string | undefined,
  outputAddress: string,
  tokenAddress: string
): Promise<Uint8Array> => {
  const nodesWithNextId = await fetchShieldedTransfers(chainId);
  const maspWeb = await getMaspWeb();
  const shieldedTransaction = await maspWeb.generateShieldedTransaction(
    nodesWithNextId,
    amount,
    inputAddress,
    outputAddress,
    tokenAddress
  );
  return Promise.resolve(shieldedTransaction);
};

// this augments the actual call with some common data that is not unique to the call
const getShieldedBalanceUsingTransfers = async (
  chainId: string,
  inputAddress: string,
  tokenAddress: string
): Promise<string> => {
  const nodesWithNextId = await fetchShieldedTransfers(chainId);
  const maspWeb = await getMaspWeb();

  const shieldedBalance = await maspWeb.getShieldedBalance(
    nodesWithNextId,
    inputAddress,
    tokenAddress
  );
  return Promise.resolve(shieldedBalance);
};
