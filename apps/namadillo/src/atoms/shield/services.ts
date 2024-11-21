import {
  Account,
  ShieldingTransferMsgValue,
  UnshieldingTransferMsgValue,
} from "@namada/types";
import BigNumber from "bignumber.js";
import * as Comlink from "comlink";
import { EncodedTxData, signTx } from "lib/query";
import { Address, ChainSettings, GasConfig } from "types";
import { Shield } from "workers/ShieldMessages";
import {
  registerTransferHandlers as shieldRegisterTransferHandlers,
  Worker as ShieldWorkerApi,
} from "workers/ShieldWorker";
import ShieldWorker from "workers/ShieldWorker?worker";
import { Unshield } from "workers/UnshieldMessages";
import {
  registerTransferHandlers as unshieldRegisterTransferHandlers,
  Worker as UnshieldWorkerApi,
} from "workers/UnshieldWorker";
import UnshieldWorker from "workers/UnshieldWorker?worker";

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

export const submitShieldTx = async (
  rpcUrl: string,
  account: Account,
  chain: ChainSettings,
  indexerUrl: string,
  params: ShieldTransferParams
): Promise<{
  msg: Shield;
  encodedTx: EncodedTxData<ShieldingTransferMsgValue>;
}> => {
  const {
    sourceAddress: source,
    destinationAddress: target,
    tokenAddress: token,
    amount,
    gasConfig,
  } = params;

  shieldRegisterTransferHandlers();
  const worker = new ShieldWorker();
  const shieldWorker = Comlink.wrap<ShieldWorkerApi>(worker);
  await shieldWorker.init({ type: "init", payload: { rpcUrl, token } });

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

  const signedTxs = await signTx("namada", encodedTx, source);

  await shieldWorker.broadcast({
    type: "broadcast",
    payload: {
      encodedTx,
      signedTxs,
    },
  });

  worker.terminate();

  return { msg, encodedTx };
};

export const submitUnshieldTx = async (
  rpcUrl: string,
  account: Account,
  chain: ChainSettings,
  indexerUrl: string,
  params: UnshieldTransferParams
): Promise<{
  msg: Unshield;
  encodedTx: EncodedTxData<UnshieldingTransferMsgValue>;
}> => {
  const {
    sourceAddress: source,
    destinationAddress: target,
    tokenAddress: token,
    amount,
    gasConfig,
  } = params;

  unshieldRegisterTransferHandlers();
  const worker = new UnshieldWorker();
  const unshieldWorker = Comlink.wrap<UnshieldWorkerApi>(worker);
  await unshieldWorker.init({ type: "init", payload: { rpcUrl, token } });

  const unshieldingMsgValue = new UnshieldingTransferMsgValue({
    source,
    data: [{ target, token, amount }],
  });

  const msg: Unshield = {
    type: "unshield",
    payload: {
      account,
      gasConfig,
      unshieldingProps: [unshieldingMsgValue],
      chain,
      indexerUrl,
    },
  };

  const { payload: encodedTx } = await unshieldWorker.unshield(msg);

  const signedTxs = await signTx("namada", encodedTx, source);

  await unshieldWorker.broadcast({
    type: "broadcast",
    payload: {
      encodedTx,
      signedTxs,
    },
  });

  worker.terminate();

  return { msg, encodedTx };
};
