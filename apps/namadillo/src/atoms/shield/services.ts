import {
  Account,
  GenDisposableSignerResponse,
  ShieldedTransferMsgValue,
  ShieldingTransferMsgValue,
  UnshieldingTransferMsgValue,
} from "@namada/types";
import BigNumber from "bignumber.js";
import * as Comlink from "comlink";
import { EncodedTxData, signTx } from "lib/query";
import { Address, ChainSettings, GasConfig } from "types";
import { Shield, ShieldedTransfer, Unshield } from "workers/MaspTxMessages";
import {
  Worker as MaspTxWorkerApi,
  registerTransferHandlers as maspTxRegisterTransferHandlers,
} from "workers/MaspTxWorker";
import MaspTxWorker from "workers/MaspTxWorker?worker";

export type ShieldTransferParams = {
  sourceAddress: Address;
  destinationAddress: Address;
  tokenAddress: Address;
  amount: BigNumber;
  gasConfig: GasConfig;
};

export type UnshieldTransferParams = {
  sourceAddress: Address;
  destinationAddress: Address;
  tokenAddress: Address;
  amount: BigNumber;
  gasConfig: GasConfig;
};

export type ShieldedTransferParams = {
  sourceAddress: Address;
  destinationAddress: Address;
  tokenAddress: Address;
  amount: BigNumber;
  gasConfig: GasConfig;
};

export const submitShieldTx = async (
  rpcUrl: string,
  account: Account,
  chain: ChainSettings,
  indexerUrl: string,
  params: ShieldTransferParams
): Promise<{
  msg: Shield;
  encodedTxData: EncodedTxData<ShieldingTransferMsgValue>;
}> => {
  const {
    sourceAddress: source,
    destinationAddress: target,
    tokenAddress: token,
    amount,
    gasConfig,
  } = params;

  maspTxRegisterTransferHandlers();
  const worker = new MaspTxWorker();
  const shieldWorker = Comlink.wrap<MaspTxWorkerApi>(worker);
  await shieldWorker.init({
    type: "init",
    payload: { rpcUrl, token, maspIndexerUrl: "" },
  });

  const shieldingMsgValue = new ShieldingTransferMsgValue({
    target,
    data: [{ source, token, amount }],
  });

  const msg: Shield = {
    type: "shield",
    payload: {
      account,
      gasConfig,
      shieldingProps: [shieldingMsgValue],
      chain,
      indexerUrl,
    },
  };

  const { payload: encodedTx } = await shieldWorker.shield(msg);

  const signedTxs = await signTx(encodedTx, source);

  await shieldWorker.broadcast({
    type: "broadcast",
    payload: {
      encodedTx,
      signedTxs,
    },
  });

  worker.terminate();

  return { msg, encodedTxData: encodedTx };
};

export const submitUnshieldTx = async (
  rpcUrl: string,
  account: Account,
  chain: ChainSettings,
  params: UnshieldTransferParams,
  disposableSigner: GenDisposableSignerResponse
): Promise<{
  msg: Unshield;
  encodedTxData: EncodedTxData<UnshieldingTransferMsgValue>;
}> => {
  const {
    sourceAddress: source,
    destinationAddress: target,
    tokenAddress: token,
    amount,
    gasConfig,
  } = params;

  maspTxRegisterTransferHandlers();
  const worker = new MaspTxWorker();
  const unshieldWorker = Comlink.wrap<MaspTxWorkerApi>(worker);
  await unshieldWorker.init({
    type: "init",
    payload: { rpcUrl, token, maspIndexerUrl: "" },
  });

  const unshieldingMsgValue = new UnshieldingTransferMsgValue({
    source,
    gasSpendingKey: source,
    data: [{ target, token, amount }],
  });

  const msg: Unshield = {
    type: "unshield",
    payload: {
      account: {
        ...account,
        publicKey: disposableSigner.publicKey,
      },
      gasConfig,
      unshieldingProps: [unshieldingMsgValue],
      chain,
    },
  };

  const { payload: encodedTxData } = await unshieldWorker.unshield(msg);

  const signedTxs = await signTx(encodedTxData, disposableSigner.address);

  await unshieldWorker.broadcast({
    type: "broadcast",
    payload: {
      encodedTx: encodedTxData,
      signedTxs,
    },
  });

  worker.terminate();

  return { msg, encodedTxData };
};

export const submitShieldedTx = async (
  rpcUrl: string,
  account: Account,
  chain: ChainSettings,
  params: ShieldedTransferParams,
  disposableSigner: GenDisposableSignerResponse
): Promise<{
  msg: ShieldedTransfer;
  encodedTxData: EncodedTxData<ShieldedTransferMsgValue>;
}> => {
  const {
    sourceAddress: source,
    destinationAddress: target,
    tokenAddress: token,
    amount,
    gasConfig,
  } = params;

  maspTxRegisterTransferHandlers();
  const worker = new MaspTxWorker();
  const workerApi = Comlink.wrap<MaspTxWorkerApi>(worker);
  await workerApi.init({
    type: "init",
    payload: { rpcUrl, token, maspIndexerUrl: "" },
  });

  const shieldedTransferMsgValue = new ShieldedTransferMsgValue({
    gasSpendingKey: source,
    data: [{ source, target, token, amount }],
  });

  const msg: ShieldedTransfer = {
    type: "shielded-transfer",
    payload: {
      account: {
        ...account,
        publicKey: disposableSigner.publicKey,
      },
      gasConfig,
      props: [shieldedTransferMsgValue],
      chain,
    },
  };

  const { payload: encodedTxData } = await workerApi.shieldedTransfer(msg);

  const signedTxs = await signTx(encodedTxData, disposableSigner.address);

  await workerApi.broadcast({
    type: "broadcast",
    payload: {
      encodedTx: encodedTxData,
      signedTxs,
    },
  });

  worker.terminate();

  return { msg, encodedTxData };
};
