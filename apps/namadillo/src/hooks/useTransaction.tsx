import { defaultAccountAtom } from "atoms/accounts";
import {
  createNotificationId,
  dispatchToastNotificationAtom,
} from "atoms/notifications";
import invariant from "invariant";
import { Atom, useAtomValue, useSetAtom } from "jotai";
import { AtomWithMutationResult } from "jotai-tanstack-query";
import { broadcastTxWithEvents, TransactionPair } from "lib/query";
import { BuildTxAtomParams, ToastNotification } from "types";
import { TransactionEventsClasses } from "types/events";
import { TransactionFeeProps, useTransactionFee } from "./useTransactionFee";

type AtomType<T> = Atom<
  AtomWithMutationResult<
    TransactionPair<T> | undefined,
    unknown,
    BuildTxAtomParams<T>,
    unknown
  >
>;

type PartialNotification = Pick<ToastNotification, "title" | "description">;

export type useTransactionProps<T> = {
  params: T[];
  createTxAtom: AtomType<T>;
  eventType: TransactionEventsClasses;
  parsePendingTxNotification?: (tx: TransactionPair<T>) => PartialNotification;
  parseErrorTxNotification?: () => PartialNotification;
  onSigned?: (tx: TransactionPair<T>) => void;
  onError?: (err: unknown) => void;
  onSuccess?: (tx: TransactionPair<T>) => void;
  onBroadcasted?: () => void;
};

export type useTransactionOutput<T> = {
  execute: (
    additionalParms?: Partial<BuildTxAtomParams<T>>
  ) => Promise<TransactionPair<T> | void>;
  isEnabled: boolean;
  isPending: boolean;
  isSuccess: boolean;
  feeProps: TransactionFeeProps;
};

export const useTransaction = <T,>({
  params,
  createTxAtom,
  eventType,
  parsePendingTxNotification,
  parseErrorTxNotification,
  onSuccess,
  onError,
  onSigned,
  onBroadcasted,
}: useTransactionProps<T>): useTransactionOutput<T> => {
  const { data: account } = useAtomValue(defaultAccountAtom);
  const {
    mutateAsync: buildTx,
    isPending,
    isSuccess,
  } = useAtomValue(createTxAtom);

  const dispatchNotification = useSetAtom(dispatchToastNotificationAtom);

  const txKinds = new Array(params.length).fill(eventType);
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

  const dispatchErrorNotification = (
    error: unknown,
    notification: PartialNotification
  ): void => {
    dispatchNotification({
      ...notification,
      id: createNotificationId(),
      details: error instanceof Error ? error.message : undefined,
      type: "error",
    });
  };

  const execute = async (
    txAdditionalParams: Partial<BuildTxAtomParams<T>> = {}
  ): Promise<TransactionPair<T> | void> => {
    invariant(
      account?.address,
      "Extension not connected or no account is selected"
    );

    const tx = await buildTx({
      params,
      gasConfig: feeProps.gasConfig,
      account,
      ...txAdditionalParams,
    });

    if (!tx) throw "Error: invalid TX created by buildTx";
    if (onSigned) {
      onSigned(tx);
    }

    if (parsePendingTxNotification) {
      dispatchPendingTxNotification(tx, parsePendingTxNotification(tx));
    }

    broadcastTxWithEvents(
      tx.encodedTxData,
      tx.signedTxs,
      tx.encodedTxData.meta?.props,
      eventType
    )
      .then(() => {
        onSuccess?.(tx);
      })
      .catch((err) => {
        if (parseErrorTxNotification) {
          dispatchErrorNotification(err, parseErrorTxNotification());
        }

        if (onError) {
          onError(err);
        } else {
          throw err;
        }
      });

    onBroadcasted?.();
    return tx;
  };

  return {
    execute,
    feeProps,
    isPending,
    isSuccess,
    isEnabled: Boolean(
      !isPending &&
        !isSuccess &&
        !feeProps.isLoading &&
        account &&
        params.length > 0
    ),
  };
};
