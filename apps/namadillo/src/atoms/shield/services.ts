import {
  Account,
  GenDisposableSignerResponse,
  ShieldingTransferMsgValue,
  UnshieldingTransferMsgValue,
} from "@namada/types";
import BigNumber from "bignumber.js";
import * as Comlink from "comlink";
import { EncodedTxData, signTx } from "lib/query";
import { Address, ChainSettings, GasConfig } from "types";
import { Shield, Unshield } from "workers/MaspTxMessages";
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

  return { msg, encodedTx };
};

export const submitUnshieldTx = async (
  rpcUrl: string,
  account: Account,
  chain: ChainSettings,
  indexerUrl: string,
  params: UnshieldTransferParams,
  disposableSigner: GenDisposableSignerResponse
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
      indexerUrl,
      vks: [],
    },
  };

  const { payload: encodedTx } = await unshieldWorker.unshield(msg);

  const signedTxs = await signTx(encodedTx, disposableSigner.address);

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
