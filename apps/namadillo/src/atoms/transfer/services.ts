import {
  Account,
  GenDisposableSignerResponse,
  ShieldedTransferMsgValue,
  ShieldedTransferProps,
  ShieldingTransferMsgValue,
  ShieldingTransferProps,
  TransparentTransferMsgValue,
  TransparentTransferProps,
  UnshieldingTransferMsgValue,
  UnshieldingTransferProps,
} from "@namada/types";
import BigNumber from "bignumber.js";
import * as Comlink from "comlink";
import { NamadaKeychain } from "hooks/useNamadaKeychain";
import {
  buildTxPair,
  EncodedTxData,
  isPublicKeyRevealed,
  signTx,
  TransactionPair,
} from "lib/query";
import { Address, ChainSettings, GasConfig } from "types";
import { getSdkInstance } from "utils/sdk";
import { Shield, ShieldedTransfer, Unshield } from "workers/MaspTxMessages";
import {
  registerTransferHandlers as maspTxRegisterTransferHandlers,
  Worker as MaspTxWorkerApi,
} from "workers/MaspTxWorker";
import MaspTxWorker from "workers/MaspTxWorker?worker";

export type WorkerTransferParams = {
  sourceAddress: Address;
  destinationAddress: Address;
  tokenAddress: Address;
  amount: BigNumber;
  gasConfig: GasConfig;
};

const workerBuildTxPair = async <T>({
  rpcUrl,
  token,
  signerAddress,
  buildTxFn,
}: {
  rpcUrl: string;
  token: Address;
  signerAddress: string;
  buildTxFn: (
    workerLink: Comlink.Remote<MaspTxWorkerApi>
  ) => Promise<EncodedTxData<T>>;
}): Promise<TransactionPair<T>> => {
  maspTxRegisterTransferHandlers();
  const worker = new MaspTxWorker();
  const workerLink = Comlink.wrap<MaspTxWorkerApi>(worker);
  await workerLink.init({
    type: "init",
    payload: { rpcUrl, token, maspIndexerUrl: "" },
  });

  const encodedTxData = await buildTxFn(workerLink);
  const signedTxs = await signTx(encodedTxData, signerAddress);

  const transactionPair: TransactionPair<T> = {
    signedTxs,
    encodedTxData,
  };

  worker.terminate();

  return transactionPair;
};

const getDisposableSigner = async (): Promise<GenDisposableSignerResponse> => {
  const namada = await new NamadaKeychain().get();
  const disposableSigner = await namada?.genDisposableKeypair();
  if (!disposableSigner) {
    throw new Error("No signer available");
  }
  return disposableSigner;
};

export const createTransparentTransferTx = async (
  chain: ChainSettings,
  account: Account,
  props: TransparentTransferMsgValue[],
  gasConfig: GasConfig,
  memo?: string
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
  rpcUrl: string,
  memo?: string
): Promise<TransactionPair<ShieldedTransferProps> | undefined> => {
  const disposableSigner = await getDisposableSigner();
  const source = props[0]?.data[0]?.source;
  const destination = props[0]?.data[0]?.target;
  const token = props[0]?.data[0]?.token;
  const amount = props[0]?.data[0]?.amount;

  return await workerBuildTxPair({
    rpcUrl,
    token,
    signerAddress: disposableSigner.address,
    buildTxFn: async (workerLink) => {
      const msgValue = new ShieldedTransferMsgValue({
        gasSpendingKey: source,
        data: [{ source, target: destination, token, amount }],
      });
      const msg: ShieldedTransfer = {
        type: "shielded-transfer",
        payload: {
          account: {
            ...account,
            publicKey: disposableSigner.publicKey,
          },
          gasConfig,
          props: [msgValue],
          chain,
          memo,
        },
      };
      return (await workerLink.shieldedTransfer(msg)).payload;
    },
  });
};

export const createShieldingTransferTx = async (
  chain: ChainSettings,
  account: Account,
  props: ShieldingTransferMsgValue[],
  gasConfig: GasConfig,
  rpcUrl: string,
  memo?: string
): Promise<TransactionPair<ShieldingTransferProps> | undefined> => {
  const source = props[0]?.data[0]?.source;
  const destination = props[0]?.target;
  const token = props[0]?.data[0]?.token;
  const amount = props[0]?.data[0]?.amount;

  return await workerBuildTxPair({
    rpcUrl,
    token,
    signerAddress: source,
    buildTxFn: async (workerLink) => {
      const publicKeyRevealed = await isPublicKeyRevealed(account.address);

      const msgValue = new ShieldingTransferMsgValue({
        target: destination,
        data: [{ source, token, amount }],
      });
      const msg: Shield = {
        type: "shield",
        payload: {
          account,
          gasConfig,
          props: [msgValue],
          chain,
          publicKeyRevealed,
          memo,
        },
      };

      return (await workerLink.shield(msg)).payload;
    },
  });
};

export const createUnshieldingTransferTx = async (
  chain: ChainSettings,
  account: Account,
  props: UnshieldingTransferMsgValue[],
  gasConfig: GasConfig,
  rpcUrl: string,
  memo?: string
): Promise<TransactionPair<UnshieldingTransferProps> | undefined> => {
  const disposableSigner = await getDisposableSigner();
  const source = props[0]?.source;
  const destination = props[0]?.data[0]?.target;
  const token = props[0]?.data[0]?.token;
  const amount = props[0]?.data[0]?.amount;

  return await workerBuildTxPair({
    rpcUrl,
    token,
    signerAddress: disposableSigner.address,
    buildTxFn: async (workerLink) => {
      const msgValue = new UnshieldingTransferMsgValue({
        source,
        gasSpendingKey: source,
        data: [{ target: destination, token, amount }],
      });
      const msg: Unshield = {
        type: "unshield",
        payload: {
          account: {
            ...account,
            publicKey: disposableSigner.publicKey,
          },
          gasConfig,
          props: [msgValue],
          chain,
          memo,
        },
      };
      return (await workerLink.unshield(msg)).payload;
    },
  });
};
