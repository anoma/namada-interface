import { useMutation, UseMutationResult } from "@tanstack/react-query";
import { defaultAccountAtom } from "atoms/accounts";
import {
  createNotificationId,
  dispatchToastNotificationAtom,
} from "atoms/notifications";
import { getDisposableSigner } from "atoms/transfer/services";
import invariant from "invariant";
import { Atom, useAtomValue, useSetAtom } from "jotai";
import { AtomWithMutationResult } from "jotai-tanstack-query";
import {
  broadcastTxWithEvents,
  EncodedTxData,
  signTx,
  TransactionPair,
} from "lib/query";
import { BuildTxAtomParams, ToastNotification } from "types";
import { TransactionEventsClasses } from "types/events";
import { TransactionFeeProps, useTransactionFee } from "./useTransactionFee";

type AtomType<T> = Atom<
  AtomWithMutationResult<
    EncodedTxData<T> | undefined,
    unknown,
    BuildTxAtomParams<T>,
    unknown
  >
>;

type PartialNotification = Pick<ToastNotification, "title" | "description">;

export type UseTransactionPropsEvents<T> = {
  onSigned?: (tx: TransactionPair<T>) => void;
  onError?: (err: unknown, context?: TransactionPair<T>) => Promise<void>;
  onBeforeCreateDisposableSigner?: () => void;
  onBeforeBuildTx?: () => void;
  onBeforeSign?: (encodedTxData: EncodedTxData<T>) => void;
  onBeforeBroadcast?: (tx: TransactionPair<T>) => Promise<void>;
  onBroadcasted?: (tx: TransactionPair<T>) => void;
};

export type UseTransactionProps<T> = {
  params: T[];
  createTxAtom: AtomType<T>;
  useDisposableSigner?: boolean;
  eventType: TransactionEventsClasses;
  parsePendingTxNotification?: (tx: TransactionPair<T>) => PartialNotification;
  parseErrorTxNotification?: () => PartialNotification;
} & UseTransactionPropsEvents<T>;

export type UseTransactionOutput<T> = {
  isEnabled: boolean;
  feeProps: TransactionFeeProps;
  execute: (
    params?: Partial<BuildTxAtomParams<T>>
  ) => Promise<TransactionPair<T>>;
} & UseMutationResult<
  TransactionPair<T>,
  Error,
  Partial<BuildTxAtomParams<T>> | undefined,
  unknown
>;

export const useTransaction = <T,>({
  params,
  createTxAtom,
  useDisposableSigner,
  eventType,
  parsePendingTxNotification,
  parseErrorTxNotification,
  onError,
  onSigned,
  onBeforeCreateDisposableSigner,
  onBeforeBuildTx,
  onBeforeSign,
  onBeforeBroadcast,
  onBroadcasted,
}: UseTransactionProps<T>): UseTransactionOutput<T> => {
  const { data: account } = useAtomValue(defaultAccountAtom);
  const dispatchNotification = useSetAtom(dispatchToastNotificationAtom);
  const { mutateAsync: performBuildTx } = useAtomValue(createTxAtom);

  // We don't want to display zeroed value when params are not set yet.
  const txKinds = new Array(Math.max(1, params.length)).fill(eventType);
  const feeProps = useTransactionFee(
    txKinds,
    ["ShieldedTransfer", "UnshieldingTransfer"].includes(eventType)
  );

  const dispatchPendingTxNotification = (
    tx: TransactionPair<T>,
    notification: PartialNotification
  ): void => {
    const notificationId =
      tx.encodedTxData.type === "buildIbcTransfer" ?
        createNotificationId(tx.encodedTxData.txs[0].innerTxHashes)
      : createNotificationId(tx.encodedTxData.txs[0].hash);
    dispatchNotification({
      ...notification,
      id: notificationId,
      type: "pending",
    });
  };

  // Handles errors BEFORE or during broadcasting.
  const dispatchErrorNotification = (
    error: unknown,
    notification: PartialNotification,
    tx: TransactionPair<T>
  ): void => {
    const notificationId =
      tx.encodedTxData.type === "buildIbcTransfer" ?
        createNotificationId(tx.encodedTxData.txs[0].innerTxHashes)
      : createNotificationId(tx.encodedTxData.txs[0].hash);
    dispatchNotification({
      ...notification,
      id: notificationId,
      details: error instanceof Error ? error.message : undefined,
      type: "error",
    });
  };

  class TransactionError<T> extends Error {
    public cause: { originalError: unknown; context: TransactionPair<T> };
    constructor(
      public message: string,
      options: {
        cause: { originalError: unknown; context: TransactionPair<T> };
      }
    ) {
      super(message);
      this.cause = options.cause;
    }
  }

  const transactionQuery = useMutation({
    mutationFn: async (
      additionalParams: Partial<BuildTxAtomParams<T>> = {}
    ) => {
      try {
        invariant(
          account?.address,
          "Extension not connected or no account is selected"
        );

        const txAdditionalParams = { ...additionalParams };
        if (useDisposableSigner) {
          onBeforeCreateDisposableSigner?.();
          txAdditionalParams.signer = await getDisposableSigner();
        }

        onBeforeBuildTx?.();
        const variables = {
          params,
          gasConfig: feeProps.gasConfig,
          account,
          ...txAdditionalParams,
        };
        const encodedTxData = await performBuildTx(variables);

        invariant(encodedTxData, "Error: invalid TX created by buildTx");
        useDisposableSigner &&
          invariant(
            txAdditionalParams.signer?.address,
            "Disposable signer could not be created"
          );

        const signerAddress =
          useDisposableSigner ?
            txAdditionalParams.signer?.address
          : account.address;

        invariant(signerAddress, "Signer address is required");
        onBeforeSign?.(encodedTxData);
        const signedTxs = await signTx(encodedTxData, signerAddress);
        const transactionPair: TransactionPair<T> = {
          signedTxs,
          encodedTxData,
        };

        onSigned?.(transactionPair);
        if (parsePendingTxNotification) {
          dispatchPendingTxNotification(
            transactionPair,
            parsePendingTxNotification(transactionPair)
          );
        }

        await onBeforeBroadcast?.(transactionPair);
        try {
          await broadcastTxWithEvents(
            transactionPair.encodedTxData,
            transactionPair.signedTxs,
            transactionPair.encodedTxData.meta?.props,
            eventType
          );
          onBroadcasted?.(transactionPair);
        } catch (error) {
          if (parseErrorTxNotification) {
            dispatchErrorNotification(
              error,
              parseErrorTxNotification(),
              transactionPair
            );
          }
          throw new TransactionError<T>("Transaction error", {
            cause: {
              originalError: error,
              context: transactionPair,
            },
          });
        }
        return transactionPair;
      } catch (error) {
        if (error instanceof TransactionError) {
          onError?.(error.cause.originalError, error.cause.context);
        } else {
          onError?.(error);
        }
        throw error;
      }
    },
  });

  return {
    ...transactionQuery,
    feeProps,
    execute: transactionQuery.mutateAsync,
    isEnabled: Boolean(
      !transactionQuery.isPending &&
        !transactionQuery.isSuccess &&
        !feeProps.isLoading &&
        account &&
        params.length > 0
    ),
  };
};
