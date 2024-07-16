import { BuiltTx, EncodedTx } from "@heliax/namada-sdk/web";
import { getIntegration } from "@namada/integrations";
import {
  Account,
  Signer,
  WrapperTxMsgValue,
  WrapperTxProps,
} from "@namada/types";
import { getIndexerApi } from "atoms/api";
import { chainParametersAtom } from "atoms/chain";
import { getSdkInstance } from "hooks";
import invariant from "invariant";
import { getDefaultStore } from "jotai";
import { ChainSettings, GasConfig } from "types";
import { TransactionEventsClasses } from "types/events";

export type TransactionPair<T> = {
  encodedTxData: EncodedTxData<T>;
  signedTx: Uint8Array;
};

export type EncodedTxData<T> = {
  type: string;
  tx: BuiltTx;
  wrapperTxMsg: Uint8Array;
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
  chain: ChainSettings
): WrapperTxMsgValue => {
  invariant(
    !!account.publicKey,
    "Account doesn't contain a publicKey attached to it"
  );

  return {
    token: chain.nativeTokenAddress,
    feeAmount: gasConfig.gasPrice,
    gasLimit: gasConfig.gasLimit,
    chainId: chain.chainId,
    publicKey: account.publicKey!,
    memo: "",
  };
};

/**
 * Builds an batch  transactions based on the provided query properties.
 * Each transaction is built through the provided transaction function `txFn`.
 * @param {T[]} queryProps - An array of properties used to build transactions.
 * @param {(WrapperTxProps, T) => Promise<EncodedTx>} txFn - Function to build each transaction.
 */
export const buildBatchTx = async <T>(
  account: Account,
  gasConfig: GasConfig,
  chain: ChainSettings,
  queryProps: T[],
  txFn: (wrapperTxProps: WrapperTxProps, props: T) => Promise<EncodedTx>
): Promise<EncodedTxData<T>> => {
  const { tx } = await getSdkInstance();
  const wrapperTxProps = getTxProps(account, gasConfig, chain);
  const txs: EncodedTx[] = [];

  // Determine if RevealPK is needed:
  const api = getIndexerApi();
  const { publicKey } = (
    await api.apiV1RevealedPublicKeyAddressGet(account.address)
  ).data;

  if (!publicKey) {
    const revealPkTx = await tx.buildRevealPk(wrapperTxProps);
    txs.push(revealPkTx);
  }

  const encodedTxs = await Promise.all(
    queryProps.map((props) => txFn.apply(tx, [wrapperTxProps, props]))
  );

  txs.push(...encodedTxs);

  const batchTx = tx.buildBatch(txs.map(({ tx }) => tx));

  return {
    tx: batchTx,
    wrapperTxMsg: tx.encodeTxArgs(wrapperTxProps),
    type: txFn.name,
    meta: {
      props: queryProps[0],
    },
  };
};

/**
 * Asynchronously signs an encoded batch transaction using Namada extension.
 */
export const signTx = async <T>(
  chain: ChainSettings,
  typedEncodedTx: EncodedTxData<T>,
  owner: string
): Promise<Uint8Array> => {
  const integration = getIntegration(chain.id);
  const signingClient = integration.signer() as Signer;

  const store = getDefaultStore();
  const { data: chainParameters } = store.get(chainParametersAtom);
  const checksums = chainParameters?.checksums;

  try {
    // Sign batch Tx
    const signedBatchTxBytes = await signingClient.sign(
      {
        txBytes: typedEncodedTx.tx.tx_bytes(),
        signingDataBytes: typedEncodedTx.tx.signing_data_bytes(),
      },
      owner,
      checksums
    );

    if (!signedBatchTxBytes) {
      throw new Error("Signing batch Tx failed");
    }

    return signedBatchTxBytes;
  } catch (err) {
    const message = err instanceof Error ? err.message : err;
    throw new Error("Signing failed: " + message);
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
  chain: ChainSettings,
  queryProps: T[],
  txFn: (wrapperTxProps: WrapperTxProps, props: T) => Promise<EncodedTx>,
  owner: string
): Promise<TransactionPair<T>> => {
  const encodedTxData = await buildBatchTx<T>(
    account,
    gasConfig,
    chain,
    queryProps,
    txFn
  );
  const signedTx = await signTx<T>(chain, encodedTxData, owner);
  return {
    signedTx,
    encodedTxData,
  };
};

export const broadcastTx = async <T>(
  encoded: EncodedTxData<T>,
  signedTx: Uint8Array,
  data?: T,
  eventType?: TransactionEventsClasses
): Promise<void> => {
  const { rpc } = await getSdkInstance();
  const transactionId = encoded.tx.tx_hash();
  eventType &&
    window.dispatchEvent(
      new CustomEvent(`${eventType}.Pending`, {
        detail: { transactionId, data },
      })
    );
  try {
    // TODO: rpc.broadcastTx returns a TxResponseProps object now, containing hashes and
    // applied status of each commitment
    await rpc.broadcastTx({
      wrapperTxMsg: encoded.wrapperTxMsg,
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
