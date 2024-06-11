import { EncodedTx } from "@heliax/namada-sdk/web";
import { getIntegration } from "@namada/integrations";
import {
  Account,
  Chain,
  Signer,
  WrapperTxMsgValue,
  WrapperTxProps,
} from "@namada/types";
import { getSdkInstance } from "hooks";
import invariant from "invariant";
import { getIndexerApi } from "slices/api";
import { TransactionEventsClasses } from "types/events";
import { GasConfig } from "types/fees";

const {
  NAMADA_INTERFACE_NAMADA_TOKEN:
    nativeToken = "tnam1qxgfw7myv4dh0qna4hq0xdg6lx77fzl7dcem8h7e",
} = process.env;

export type TransactionPair<T> = {
  encodedTxData: EncodedTxData<T>;
  signedTx: Uint8Array;
};

export type EncodedTxData<T> = {
  type: string;
  encodedTx: EncodedTx;
  meta?: {
    props: T;
  };
};

export type TransactionNotification = {
  success?: { title: string; text: string };
  error?: { title: string; text: string };
};

export type PreparedTransaction<T> = {
  encodedTx: EncodedTx;
  signedTx: Uint8Array;
  meta: T;
};

export const revealPublicKeyType = "revealPublicKey";

const getTxProps = (
  account: Account,
  gasConfig: GasConfig,
  chain: Chain
): WrapperTxMsgValue => {
  const address = nativeToken;
  invariant(!!address, "Invalid currency address");
  invariant(
    !!account.publicKey,
    "Account doesn't contain a publicKey attached to it"
  );

  return {
    token: address!,
    feeAmount: gasConfig.gasPrice,
    gasLimit: gasConfig.gasLimit,
    chainId: chain.chainId,
    publicKey: account.publicKey!,
    memo: "",
  };
};

/**
 * Builds an array of encoded transactions based on the provided query properties.
 * Each transaction is processed through the provided transaction function `txFn`.
 * @param {T[]} queryProps - An array of properties used to build transactions.
 * @param {(WrapperTxProps, T) => Promise<EncodedTx>} txFn - Function to build each transaction.
 */
export const buildTxArray = async <T>(
  account: Account,
  gasConfig: GasConfig,
  chain: Chain,
  queryProps: T[],
  txFn: (wrapperTxProps: WrapperTxProps, props: T) => Promise<EncodedTx>
): Promise<EncodedTxData<T>[]> => {
  const { tx } = await getSdkInstance();
  const wrapperTxProps = getTxProps(account, gasConfig, chain);
  const txArray: EncodedTxData<T>[] = [];

  // Determine if RevealPK is needed:
  const api = getIndexerApi();
  const { publicKey } = (
    await api.apiV1RevealedPublicKeyAddressGet(account.address)
  ).data;

  if (!publicKey) {
    const revealPkTx = await tx.buildRevealPk(wrapperTxProps, account.address);
    txArray.push({ type: revealPublicKeyType, encodedTx: revealPkTx });
  }

  const encodedTxs = await Promise.all(
    queryProps.map((props) => txFn.apply(tx, [wrapperTxProps, props]))
  );

  const typedEncodedTxs = encodedTxs.map((encodedTx, index) => ({
    encodedTx,
    type: txFn.name,
    meta: {
      props: queryProps[index],
    },
  }));

  txArray.push(...typedEncodedTxs);
  return txArray;
};

/**
 * Asynchronously signs an array of encoded transactions using Namada extension.
 */
export const signTxArray = async <T>(
  chain: Chain,
  typedEncodedTxs: EncodedTxData<T>[],
  owner: string
): Promise<Uint8Array[]> => {
  const integration = getIntegration(chain.id);
  const signingClient = integration.signer() as Signer;
  try {
    // TODO: Don't submit RevealPK with other Tx!:
    const signedTxs = await signingClient.sign(
      typedEncodedTxs[0].encodedTx.tx.tx_type(),
      typedEncodedTxs.map(({ encodedTx }) => encodedTx.tx),
      owner
    );

    if (!signedTxs) {
      throw new Error("Signing failed: No signed transactions returned");
    }

    return signedTxs;
  } catch (err) {
    throw new Error("Signing failed: " + err);
  }
};

/**
 * Builds an array of **transaction pairs**. Each transaction pair consists of a signed
 * transaction and its corresponding encoded transaction data.
 *
 * Encoded transaction data includes the transaction itself along with additional metadata
 * that holds the initial values used for its creation.
 */
export const buildTxPair = async <T>(
  account: Account,
  gasConfig: GasConfig,
  chain: Chain,
  queryProps: T[],
  txFn: (wrapperTxProps: WrapperTxProps, props: T) => Promise<EncodedTx>,
  owner: string
): Promise<TransactionPair<T>[]> => {
  const encodedTxs = await buildTxArray<T>(
    account,
    gasConfig,
    chain,
    queryProps,
    txFn
  );
  const signedTxs = await signTxArray<T>(chain, encodedTxs, owner);
  return signedTxs.map(
    (tx, index): TransactionPair<T> => ({
      signedTx: tx,
      encodedTxData: encodedTxs[index],
    })
  );
};

export const broadcastTx = async <T>(
  encoded: EncodedTx,
  signedTx: Uint8Array,
  data?: T,
  eventType?: TransactionEventsClasses
): Promise<void> => {
  const { rpc } = await getSdkInstance();
  const transactionId = encoded.hash();
  eventType &&
    window.dispatchEvent(
      new CustomEvent(`${eventType}.Pending`, {
        detail: { transactionId, data },
      })
    );
  try {
    await rpc.broadcastTx({
      wrapperTxMsg: encoded.txMsg,
      tx: signedTx,
    });
    eventType &&
      window.dispatchEvent(
        new CustomEvent(`${eventType}.Success`, {
          detail: { transactionId, data },
        })
      );
  } catch (error) {
    eventType &&
      window.dispatchEvent(
        new CustomEvent(`${eventType}.Error`, {
          detail: { transactionId, data, error },
        })
      );
  }
};
