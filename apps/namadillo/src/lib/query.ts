import { Sdk } from "@namada/sdk/web";
import {
  Account,
  AccountType,
  BatchTxResultMsgValue,
  TxMsgValue,
  TxProps,
  WrapperTxProps,
} from "@namada/types";
import { getIndexerApi } from "atoms/api";
import { chainParametersAtom } from "atoms/chain";
import { NamadaKeychain } from "hooks/useNamadaKeychain";
import invariant from "invariant";
import { getDefaultStore } from "jotai";
import { Address, ChainSettings, GasConfig } from "types";
import {
  TransactionEventsClasses,
  TransactionEventsStatus,
} from "types/events";
import { toDisplayAmount } from "utils";
import { getSdkInstance } from "utils/sdk";

export type TransactionPair<T> = {
  encodedTxData: EncodedTxData<T>;
  signedTxs: Uint8Array[];
};

export type EncodedTxData<T> = {
  type: string;
  txs: TxProps[] &
    {
      innerTxHashes: string[];
    }[];
  wrapperTxProps: WrapperTxProps;
  meta?: {
    props: T[];
  };
};

export type TransactionNotification = {
  success?: { title: string; text: string };
  error?: { title: string; text: string };
};

export type PreparedTransaction<T> = {
  encodedTx: WrapperTxProps;
  signedTx: Uint8Array;
  meta: T;
};

export const revealPublicKeyType = "revealPublicKey";

const getTxProps = (
  account: Account,
  gasConfig: GasConfig,
  chain: ChainSettings,
  memo?: string
): WrapperTxProps => {
  invariant(
    !!account.publicKey,
    "Account doesn't contain a publicKey attached to it"
  );

  return {
    token: gasConfig.gasToken,
    // TODO should we do toDisplayAmount for all tokens or only NAM?
    feeAmount:
      gasConfig.asset ?
        toDisplayAmount(gasConfig.asset, gasConfig.gasPrice)
      : gasConfig.gasPrice,
    gasLimit: gasConfig.gasLimit,
    chainId: chain.chainId,
    publicKey: account.publicKey!,
    memo,
  };
};

export const isPublicKeyRevealed = async (
  address: Address
): Promise<boolean> => {
  const api = getIndexerApi();
  let publicKey: string | undefined;
  try {
    publicKey = (await api.apiV1RevealedPublicKeyAddressGet(address)).data
      ?.publicKey;
  } catch {}
  return Boolean(publicKey);
};

/**
 * Builds an batch  transactions based on the provided query properties.
 * Each transaction is built through the provided transaction function `txFn`.
 * @param {T[]} queryProps - An array of properties used to build transactions.
 * @param {(WrapperTxProps, T) => Promise<TxMsgValue>} txFn - Function to build each transaction.
 */
export const buildTx = async <T>(
  sdk: Sdk,
  account: Account,
  gasConfig: GasConfig,
  chain: ChainSettings,
  queryProps: T[],
  txFn: (wrapperTxProps: WrapperTxProps, props: T) => Promise<TxMsgValue>,
  publicKeyRevealed: boolean,
  memo?: string
): Promise<EncodedTxData<T>> => {
  const { tx } = sdk;
  const wrapperTxProps = getTxProps(account, gasConfig, chain, memo);
  const txs: TxMsgValue[] = [];
  const txProps: TxProps[] = [];

  // Determine if RevealPK is needed:
  if (!publicKeyRevealed) {
    const revealPkTx = await tx.buildRevealPk(wrapperTxProps);
    txs.push(revealPkTx);
  }

  const encodedTxs = await Promise.all(
    queryProps.map((props) => txFn.apply(tx, [wrapperTxProps, props]))
  );

  txs.push(...encodedTxs);

  if (account.type === AccountType.Ledger) {
    txProps.push(...txs);
  } else {
    txProps.push(tx.buildBatch(txs));
  }

  return {
    txs: txProps.map(({ args, hash, bytes, signingData }) => {
      const innerTxHashes = sdk.tx.getInnerTxHashes(bytes);
      return {
        args,
        hash,
        bytes,
        signingData,
        innerTxHashes,
      };
    }),
    wrapperTxProps,
    type: txFn.name,
    meta: {
      props: queryProps,
    },
  };
};

/**
 * Asynchronously signs an encoded batch transaction using Namada extension.
 */
export const signTx = async <T>(
  typedEncodedTx: EncodedTxData<T>,
  owner: string
): Promise<Uint8Array[]> => {
  const namada = await new NamadaKeychain().get();
  const signingClient = namada?.getSigner();

  const store = getDefaultStore();
  const { data: chainParameters } = store.get(chainParametersAtom);
  const checksums = chainParameters?.checksums;

  try {
    // Sign txs
    const signedTxBytes = await signingClient?.sign(
      typedEncodedTx.txs,
      owner,
      checksums
    );

    if (!signedTxBytes) {
      throw new Error("Signing batch Tx failed");
    }

    return signedTxBytes;
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
  txFn: (wrapperTxProps: WrapperTxProps, props: T) => Promise<TxMsgValue>,
  owner: string,
  memo?: string
): Promise<TransactionPair<T>> => {
  const sdk = await getSdkInstance();
  const publicKeyRevealed = await isPublicKeyRevealed(account.address);
  const encodedTxData = await buildTx<T>(
    sdk,
    account,
    gasConfig,
    chain,
    queryProps,
    txFn,
    publicKeyRevealed,
    memo
  );
  const signedTxs = await signTx<T>(encodedTxData, owner);
  return {
    signedTxs,
    encodedTxData,
  };
};

export const broadcastTx = async <T>(
  encodedTx: EncodedTxData<T>,
  signedTxs: Uint8Array[],
  data?: T[],
  eventType?: TransactionEventsClasses
): Promise<void> => {
  const { rpc } = await getSdkInstance();

  if (encodedTx.txs.length !== signedTxs.length) {
    throw new Error("Did not receive enough signatures!");
  }

  eventType &&
    window.dispatchEvent(
      new CustomEvent(`${eventType}.Pending`, {
        detail: { tx: encodedTx.txs, data },
      })
    );

  const hashes = encodedTx.txs
    .map((tx) => (tx as TxProps & { innerTxHashes: string[] }).innerTxHashes)
    .flat();

  Promise.allSettled(
    encodedTx.txs.map((_, i) =>
      rpc.broadcastTx(signedTxs[i], encodedTx.wrapperTxProps)
    )
  ).then((results) => {
    try {
      const commitments = results.map((result) => {
        if (result.status === "fulfilled") {
          return result.value.commitments;
        } else {
          // Throw wrapper error if encountered
          throw new Error(`Broadcast Tx failed! ${result.reason}`);
        }
      });
      const { status, successData, failedData } = parseTxAppliedErrors(
        commitments.flat(),
        hashes,
        data!
      );

      // Notification
      eventType &&
        window.dispatchEvent(
          new CustomEvent(`${eventType}.${status}`, {
            detail: {
              tx: encodedTx.txs,
              data,
              successData,
              failedData,
            },
          })
        );
    } catch (error) {
      window.dispatchEvent(
        new CustomEvent(`${eventType}.Error`, {
          detail: {
            tx: encodedTx.txs,
            data,
            error,
          },
        })
      );
    }
  });
};

type TxAppliedResults<T> = {
  status: TransactionEventsStatus;
  successData?: T[];
  failedData?: T[];
};

// Given an array of broadcasted Tx results,
// collect any errors
const parseTxAppliedErrors = <T>(
  results: BatchTxResultMsgValue[],
  txHashes: string[],
  data: T[]
): TxAppliedResults<T> => {
  const txErrors: string[] = [];
  const dataWithHash = data?.map((d, i) => ({
    ...d,
    hash: txHashes[i],
  }));

  results.forEach((result) => {
    const { hash, isApplied } = result;
    if (!isApplied) {
      txErrors.push(hash);
    }
  });

  if (txErrors.length) {
    const successData = dataWithHash?.filter((data) => {
      return !txErrors.includes(data.hash);
    });

    const failedData = dataWithHash?.filter((data) => {
      return txErrors.includes(data.hash);
    });

    if (successData?.length) {
      return {
        status: "PartialSuccess",
        successData,
        failedData,
      };
    } else {
      return { status: "Error", failedData };
    }
  }

  return { status: "Success" };
};
