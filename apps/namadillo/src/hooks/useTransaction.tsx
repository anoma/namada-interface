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
import { BuildTxAtomParams, GasConfig, ToastNotification } from "types";
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

export type useTransactionProps<T> = {
  params: T[];
  createTxAtom: AtomType<T>;
  eventType: TransactionEventsClasses;
  parsePendingTxNotification?: (tx: TransactionPair<T>) => PartialNotification;
  parseErrorTxNotification?: () => PartialNotification;
  onSigned?: (tx: TransactionPair<T>) => void;
  onError?: (err: unknown) => void;
  onSuccess?: (tx: TransactionPair<T>) => void;
};

type useTransactionOutput<T> = {
  execute: (
    additionalParms?: Partial<BuildTxAtomParams<T>>
  ) => Promise<TransactionPair<T> | void>;
  isEnabled: boolean;
  isPending: boolean;
  isSuccess: boolean;
  gasConfig: GasConfig | undefined;
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
}: useTransactionProps<T>): useTransactionOutput<T> => {
  const { data: account } = useAtomValue(defaultAccountAtom);
  const {
    mutateAsync: buildTx,
    isPending,
    isSuccess,
  } = useAtomValue(createTxAtom);

  const dispatchNotification = useSetAtom(dispatchToastNotificationAtom);

  const gasConfig = useAtomValue(
    defaultGasConfigFamily(new Array(params.length).fill(eventType))
  );

  const validate = (): void => {
    invariant(gasConfig.data, "Gas config not loaded");
    invariant(
      account?.address,
      "Extension not connected or no account is selected"
    );
  };

  const broadcast = (tx: TransactionPair<T>): Promise<void[]> =>
    Promise.all(
      tx.signedTxs.map((signedTx) =>
        broadcastTx(
          tx.encodedTxData,
          signedTx,
          tx.encodedTxData.meta?.props,
          eventType
        )
      )
    );

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
    try {
      validate();
      const tx = await buildTx({
        params,
        gasConfig: gasConfig.data!,
        account: account!,
        ...txAdditionalParams,
      });

      if (!tx) throw "Error: invalid TX created by buildTx";
      if (onSigned) {
        onSigned(tx);
      }

      await broadcast(tx);

      if (parsePendingTxNotification) {
        dispatchPendingTxNotification(tx, parsePendingTxNotification(tx));
      }

      if (onSuccess) {
        onSuccess(tx);
      }

      return tx;
    } catch (err) {
      if (parseErrorTxNotification) {
        dispatchErrorNotification(err, parseErrorTxNotification());
      }

      if (onError) {
        onError(err);
      } else {
        throw err;
      }
    }
  };

  return {
    execute,
    isPending,
    isSuccess,
    gasConfig: gasConfig.data,
    isEnabled: Boolean(
      !isPending &&
        !isSuccess &&
        gasConfig?.data &&
        account &&
        params.length > 0
    ),
  };
};
