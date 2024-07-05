import { BuiltTx, EncodedTx } from "@heliax/namada-sdk/web";
import { getIntegration } from "@namada/integrations";
import {
  Account,
  Signer,
  WrapperTxMsgValue,
  WrapperTxProps,
} from "@namada/types";
import { getIndexerApi } from "atoms/api";
import { getSdkInstance } from "hooks";
import invariant from "invariant";
import { ChainSettings, GasConfig } from "types";
import { TransactionEventsClasses } from "types/events";

export type TransactionPair<T> = {
  encodedTxData: EncodedTxData<T>;
  signedTx: Uint8Array;
};

export type EncodedTxData<T> = {
  type: string;
  tx: BuiltTx;
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
 * Builds an array of encoded transactions based on the provided query properties.
 * Each transaction is processed through the provided transaction function `txFn`.
 * @param {T[]} queryProps - An array of properties used to build transactions.
 * @param {(WrapperTxProps, T) => Promise<EncodedTx>} txFn - Function to build each transaction.
 */
export const buildTxArray = async <T>(
  account: Account,
  gasConfig: GasConfig,
  chain: ChainSettings,
  queryProps: T[],
  txFn: (wrapperTxProps: WrapperTxProps, props: T) => Promise<EncodedTx>
): Promise<EncodedTxData<T>[]> => {
  const { tx } = await getSdkInstance();
  const wrapperTxProps = getTxProps(account, gasConfig, chain);
  const txArray: EncodedTxData<T>[] = [];
  const txs: BuiltTx[] = [];

  // Determine if RevealPK is needed:
  const api = getIndexerApi();
  const { publicKey } = (
    await api.apiV1RevealedPublicKeyAddressGet(account.address)
  ).data;

  if (!publicKey) {
    const revealPkTx = await tx.buildRevealPk(wrapperTxProps, account.address);
    txs.push(revealPkTx.tx);
  }

  const encodedTxs = await Promise.all(
    queryProps.map((props) => txFn.apply(tx, [wrapperTxProps, props]))
  );

  txs.push(...encodedTxs.map((tx) => tx.tx));

  const initialTx = encodedTxs[0].tx;
  const wrapperTxMsg = initialTx.wrapper_tx_msg();

  const batchTx = tx.buildBatch(txs, wrapperTxMsg);

  txArray.push({
    tx: batchTx,
    type: txFn.name,
    meta: {
      props: queryProps[0],
    },
  });
  return txArray;
};

/**
 * Asynchronously signs an array of encoded transactions using Namada extension.
 */
export const signTxArray = async <T>(
  chain: ChainSettings,
  typedEncodedTxs: EncodedTxData<T>[],
  owner: string
): Promise<Uint8Array[]> => {
  const integration = getIntegration(chain.id);
  const signingClient = integration.signer() as Signer;
  const signedTxs: Uint8Array[] = [];

  try {
    // Sign batch Tx
    const signedBatchTxBytes = await signingClient.sign(
      typedEncodedTxs[0].tx.tx_type(),
      {
        txBytes: typedEncodedTxs[0].tx.tx_bytes(),
        signingDataBytes: typedEncodedTxs[0].tx.signing_data_bytes(),
      },
      owner,
      typedEncodedTxs[0].tx.wrapper_tx_msg()
    );

    if (!signedBatchTxBytes) {
      throw new Error("Signing batch Tx failed");
    }

    signedTxs.push(signedBatchTxBytes);
    return signedTxs;
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
  encoded: BuiltTx,
  signedTx: Uint8Array,
  data?: T,
  eventType?: TransactionEventsClasses
): Promise<void> => {
  const { rpc } = await getSdkInstance();
  const transactionId = encoded.tx_hash();
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
      wrapperTxMsg: encoded.wrapper_tx_msg(),
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
