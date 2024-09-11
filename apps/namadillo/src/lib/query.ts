import { getIntegration } from "@namada/integrations";
import {
  Account,
  AccountType,
  Signer,
  TxMsgValue,
  TxProps,
  WrapperTxProps,
} from "@namada/types";
import { getIndexerApi } from "atoms/api";
import { chainParametersAtom } from "atoms/chain";
import { getSdkInstance } from "hooks";
import invariant from "invariant";
import { getDefaultStore } from "jotai";
import { Address, ChainSettings, GasConfig } from "types";
import { TransactionEventsClasses } from "types/events";

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
  chain: ChainSettings
): WrapperTxProps => {
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
  account: Account,
  gasConfig: GasConfig,
  chain: ChainSettings,
  queryProps: T[],
  txFn: (wrapperTxProps: WrapperTxProps, props: T) => Promise<TxMsgValue>
): Promise<EncodedTxData<T>> => {
  const { tx } = await getSdkInstance();
  const wrapperTxProps = getTxProps(account, gasConfig, chain);
  const txs: TxMsgValue[] = [];
  const txProps: TxProps[] = [];

  // Determine if RevealPK is needed:
  const publicKeyRevealed = await isPublicKeyRevealed(account.address);
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

  const sdk = await getSdkInstance();
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
  chain: ChainSettings,
  typedEncodedTx: EncodedTxData<T>,
  owner: string
): Promise<Uint8Array[]> => {
  const integration = getIntegration(chain.id);
  const signingClient = integration.signer() as Signer;

  const store = getDefaultStore();
  const { data: chainParameters } = store.get(chainParametersAtom);
  const checksums = chainParameters?.checksums;

  try {
    // Sign txs
    const signedTxBytes = await signingClient.sign(
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
  owner: string
): Promise<TransactionPair<T>> => {
  const encodedTxData = await buildTx<T>(
    account,
    gasConfig,
    chain,
    queryProps,
    txFn
  );
  const signedTxs = await signTx<T>(chain, encodedTxData, owner);
  return {
    signedTxs,
    encodedTxData,
  };
};

export const broadcastTx = async <T>(
  encodedTx: EncodedTxData<T>,
  signedTx: Uint8Array,
  data?: T[],
  eventType?: TransactionEventsClasses
): Promise<void> => {
  const { rpc } = await getSdkInstance();

  encodedTx.txs.forEach(async (tx) => {
    const { innerTxHashes } = tx as TxProps & { innerTxHashes: string[] };
    const dataWithHash = data?.map((d, i) => ({
      ...d,
      hash: innerTxHashes[i],
    }));

    eventType &&
      window.dispatchEvent(
        new CustomEvent(`${eventType}.Pending`, {
          detail: { tx, data },
        })
      );
    try {
      const response = await rpc.broadcastTx(
        signedTx,
        encodedTx.wrapperTxProps
      );

      const commitmentErrors: string[] = [];
      response.commitments.forEach(({ hash, isApplied }) => {
        if (!isApplied) {
          commitmentErrors.push(hash);
        }
      });

      if (commitmentErrors.length) {
        const successData = dataWithHash?.filter((data) => {
          return !commitmentErrors.includes(data.hash);
        });

        const failedData = dataWithHash?.filter((data) => {
          return commitmentErrors.includes(data.hash);
        });

        if (successData?.length) {
          eventType &&
            window.dispatchEvent(
              new CustomEvent(`${eventType}.PartialSuccess`, {
                detail: {
                  tx,
                  data,
                  successData,
                  failedData,
                },
              })
            );
        } else {
          eventType &&
            window.dispatchEvent(
              new CustomEvent(`${eventType}.Error`, {
                detail: { tx, data, failedData },
              })
            );
        }
        return;
      }

      // If no errors were reported, display Success toast
      eventType &&
        window.dispatchEvent(
          new CustomEvent(`${eventType}.Success`, {
            detail: { tx, data },
          })
        );
    } catch (error) {
      eventType &&
        window.dispatchEvent(
          new CustomEvent(`${eventType}.Error`, {
            detail: { tx, data, error },
          })
        );
    }
  });
};
