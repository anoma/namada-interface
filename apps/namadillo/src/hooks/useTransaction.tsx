import { defaultAccountAtom } from "atoms/accounts";
import { defaultGasConfigFamily } from "atoms/fees";
import {
  createNotificationId,
  dispatchToastNotificationAtom,
} from "atoms/notifications";
import invariant from "invariant";
import { Atom, useAtomValue, useSetAtom } from "jotai";
import { AtomWithMutationResult } from "jotai-tanstack-query";
import { broadcastTx, TransactionPair } from "lib/query";
import { BuildTxAtomParams, ToastNotification } from "types";
import { TransactionEventsClasses } from "types/events";

type AtomType<T> = Atom<
  AtomWithMutationResult<
    TransactionPair<T> | undefined,
    unknown,
    BuildTxAtomParams<T>,
    unknown
  >
>;

type PartialNotification = Pick<ToastNotification, "title" | "description">;

type useTransactionProps<T> = {
  params: T[];
  createTxAtom: AtomType<T>;
  eventType: TransactionEventsClasses;
  pendingTxNotification?: PartialNotification;
  onSigned?: (tx: TransactionPair<T>) => void;
  onError?: (err: unknown) => void;
  onSuccess?: (tx: TransactionPair<T>) => void;
};

type useTransactionOutput = {
  execute: () => void;
  isEnabled: boolean;
  isPending: boolean;
  isSuccess: boolean;
};

export const useTransaction = <T,>({
  params,
  createTxAtom,
  eventType,
  pendingTxNotification,
  onSuccess,
  onError,
}: useTransactionProps<T>): useTransactionOutput => {
  const { data: account } = useAtomValue(defaultAccountAtom);
  const {
    mutateAsync: buildTx,
    isPending,
    isSuccess,
  } = useAtomValue(createTxAtom);

  const dispatchNotification = useSetAtom(dispatchToastNotificationAtom);

  const gasConfig = useAtomValue(
    defaultGasConfigFamily(
      Array(Object.keys(params || {}).length).fill(eventType)
    )
  );

  const validate = (): void => {
    invariant(gasConfig.data, "Gas config not loaded");
    invariant(
      account?.address,
      "Extension not connected or no account is selected"
    );
  };

  const broadcast = (tx: TransactionPair<T>): void => {
    tx.signedTxs.forEach((signedTx) => {
      broadcastTx(
        tx.encodedTxData,
        signedTx,
        tx.encodedTxData.meta?.props,
        eventType
      );
    });
  };

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

  const execute = async (): Promise<void> => {
    try {
      validate();
      const tx = await buildTx({
        params,
        gasConfig: gasConfig.data!,
        account,
      });

      if (!tx) throw "Error: invalid TX created by buildTx";
      broadcast(tx);

      if (pendingTxNotification) {
        dispatchPendingTxNotification(tx, pendingTxNotification);
      }

      if (onSuccess) {
        onSuccess(tx);
      }
    } catch (err) {
      if (onError) {
        onError(err);
      }
    }
  };

  return {
    execute,
    isPending,
    isSuccess,
    isEnabled: Boolean(
      !isPending &&
        !isSuccess &&
        gasConfig?.data &&
        account &&
        params.length > 0
    ),
  };
};
