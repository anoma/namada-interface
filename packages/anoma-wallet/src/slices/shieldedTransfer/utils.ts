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
  console.log("fetchShieldedTransfers 1");
  const transfers: NodeWithNextId[] = [];
  const headTransactionId = await fetchShieldedTransferById();
  console.log(headTransactionId, "fetchShieldedTransfers 2");
  if (headTransactionId) {
    console.log("fetchShieldedTransfers 2.1");
    transfers.push(headTransactionId);
  }
  console.log("fetchShieldedTransfers 3");
  console.log(transfers, "fetchShieldedTransfers 3");
  let latestTransfer: NodeWithNextId = transfers[transfers.length - 1];
  console.log("fetchShieldedTransfers 4");
  while (latestTransfer.nextTransactionId) {
    console.log("fetchShieldedTransfers 5");
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

const createShieldedTransferUsingTransers = async (
  nodesWithNextId: NodeWithNextId[]
): Promise<Uint8Array> => {
  const maspWeb = await MaspWeb.init();
  await maspWeb.performShieldedTransaction(nodesWithNextId);
  const placeHolder = new Uint8Array([1, 2, 3]);
  return Promise.resolve(placeHolder);
};

// exposes a simple API for the rest of the app to create ShieldedTransactions
export const createShieldedTransfer = async (): Promise<Uint8Array> => {
  try {
    const existingShieldedTransfers = await fetchShieldedTransfers();
    const shieldedTransfer = await createShieldedTransferUsingTransers(
      existingShieldedTransfers
    );
    return Promise.resolve(shieldedTransfer);
  } catch (error) {
    return Promise.reject(error);
  }
};

export const createShieldedTransaction = async (): Promise<Uint8Array> => {
  try {
    const shieldedTransfer = await createShieldedTransfer();
    return Promise.resolve(shieldedTransfer);
  } catch (error) {
    return Promise.reject(error);
  }
};
