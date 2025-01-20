import { defaultAccountAtom } from "atoms/accounts";
import { defaultGasConfigFamily } from "atoms/fees";
import {
  createNotificationId,
  dispatchToastNotificationAtom,
} from "atoms/notifications";
import invariant from "invariant";
import { Atom, useAtomValue, useSetAtom } from "jotai";
import { AtomWithMutationResult } from "jotai-tanstack-query";
import { broadcastTxWithEvents, TransactionPair } from "lib/query";
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
  onBroadcasted?: () => void;
  gasConfig?: GasConfig;
};

export type useTransactionOutput<T> = {
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
  onBroadcasted,
  gasConfig,
}: useTransactionProps<T>): useTransactionOutput<T> => {
  const { data: account } = useAtomValue(defaultAccountAtom);
  const {
    mutateAsync: buildTx,
    isPending,
    isSuccess,
  } = useAtomValue(createTxAtom);

  const dispatchNotification = useSetAtom(dispatchToastNotificationAtom);

  const autoGasConfig = useAtomValue(
    defaultGasConfigFamily(new Array(params.length).fill(eventType))
  );

  const selectedGasConfig = gasConfig || autoGasConfig.data;

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
    invariant(selectedGasConfig, "Gas config not loaded");
    invariant(
      account?.address,
      "Extension not connected or no account is selected"
    );

    const tx = await buildTx({
      params,
      gasConfig: selectedGasConfig,
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
    isPending,
    isSuccess,
    gasConfig: selectedGasConfig,
    isEnabled: Boolean(
      !isPending &&
        !isSuccess &&
        selectedGasConfig &&
        account &&
        params.length > 0
    ),
  };
};
