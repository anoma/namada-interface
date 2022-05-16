import { Config } from "config";
import { RpcClient } from "lib";

const { network } = new Config();
const rpcClient = new RpcClient(network);

import { NodeWithNextId, MaspWeb } from "@anoma/masp-web";

const getMaspAddress = (): string => {
  const maspAddressEncoded =
    "atest1v4ehgw36xaryysfsx5unvve4g5my2vjz89p52sjxxgenzd348yuyyv3hg3pnjs35g5unvde4ca36y5";
  return maspAddressEncoded;
};

// returns a transaction, nextTransaction tuple by transaction id
const fetchShieldedTransferById = async (
  transactionId?: string
): Promise<NodeWithNextId | undefined> => {
  const maspAddress = getMaspAddress();
  const shieldedTransactionId = await rpcClient.queryShieldedTransaction(
    maspAddress,
    transactionId
  );
  return Promise.resolve(shieldedTransactionId);
};

// go through linked transfer and return them in an array
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

const createShieldedTransferUsingTransfers = async (
  nodesWithNextId: NodeWithNextId[],
  amount: BigInt
): Promise<Uint8Array> => {
  const maspWeb = await MaspWeb.init();
  const shieldedTransaction = await maspWeb.generateShieldedTransaction(
    nodesWithNextId,
    amount
  );
  return Promise.resolve(shieldedTransaction);
};

export const createShieldedTransfer = async (
  amount: number
): Promise<Uint8Array> => {
  try {
    const amountAsBigInt = BigInt(amount);
    const existingShieldedTransfers = await fetchShieldedTransfers();
    const shieldedTransfer = await createShieldedTransferUsingTransfers(
      existingShieldedTransfers,
      amountAsBigInt
    );
    return Promise.resolve(shieldedTransfer);
  } catch (error) {
    return Promise.reject(error);
  }
};

const createShieldedTransaction = async (
  amount: number
): Promise<Uint8Array> => {
  try {
    const shieldedTransfer = await createShieldedTransfer(amount);
    return Promise.resolve(shieldedTransfer);
  } catch (error) {
    return Promise.reject(error);
  }
};
