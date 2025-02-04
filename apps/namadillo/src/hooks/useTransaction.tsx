import { TxProps } from "@namada/types";
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
  onError?: (err: unknown) => void;
  onSuccess?: (tx: TransactionPair<T>) => void;
  onBeforeCreateDisposableSigner?: () => void;
  onBeforeBuildTx?: () => void;
  onBeforeSign?: (encodedTxData: EncodedTxData<T>) => void;
  onBeforeBroadcast?: (tx: TransactionPair<T>) => void;
  onBroadcasted?: () => void;
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
  onSuccess,
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
  const {
    mutateAsync: performBuildTx,
    isPending,
    isSuccess,
  } = useAtomValue(createTxAtom);

  // We don't want to display zeroed value when params are not set yet.
  const txKinds = new Array(Math.max(1, params.length)).fill(eventType);
  const feeProps = useTransactionFee(txKinds);

  const dispatchPendingTxNotification = (
    tx: TransactionPair<T>,
    notification: PartialNotification
  ): void => {
    dispatchNotification({
      ...notification,
      id: createNotificationId(tx.encodedTxData.txs),
      type: "pending",
    });
  };

  // Handles errors BEFORE or during broadcasting.
  const dispatchErrorNotification = (
    error: unknown,
    notification: PartialNotification,
    tx: TxProps | TxProps[]
  ): void => {
    dispatchNotification({
      ...notification,
      id: createNotificationId(tx),
      details: error instanceof Error ? error.message : undefined,
      type: "error",
    });
  };

  const transactionQuery = useMutation({
    mutationFn: async (
      additionalParams: Partial<BuildTxAtomParams<T>> = {}
    ) => {
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
      const encodedTxData = await performBuildTx({
        params,
        gasConfig: feeProps.gasConfig,
        account,
        ...txAdditionalParams,
      });

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

      onBeforeBroadcast?.(transactionPair);
      broadcastTxWithEvents(
        transactionPair.encodedTxData,
        transactionPair.signedTxs,
        transactionPair.encodedTxData.meta?.props,
        eventType
      )
        .then(() => {
          onSuccess?.(transactionPair);
        })
        .catch((err) => {
          if (parseErrorTxNotification) {
            dispatchErrorNotification(
              err,
              parseErrorTxNotification(),
              encodedTxData.txs
            );
          }
          if (onError) {
            onError(err);
          } else {
            throw err;
          }
        });

      onBroadcasted?.();
      return transactionPair;
    },
  });

  return {
    ...transactionQuery,
    feeProps,
    execute: transactionQuery.mutateAsync,
    isEnabled: Boolean(
      !isPending &&
        !isSuccess &&
        !feeProps.isLoading &&
        account &&
        params.length > 0
    ),
  };
};
