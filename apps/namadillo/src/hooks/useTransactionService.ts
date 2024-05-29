import { useAtomValue, useSetAtom } from "jotai";
import {
  PreparedTransaction,
  TransactionNotification,
  broadcastTx,
} from "lib/query";
import { useEffect } from "react";
import {
  dispatchToastNotificationAtom,
  filterToastNotificationsAtom,
} from "slices/notifications";
import {
  clearTransactionQueueAtom,
  transactionsAtom,
} from "slices/transactions";

export const useTransactionService = (): void => {
  const transactions = useAtomValue(transactionsAtom);
  const clearTransactions = useSetAtom(clearTransactionQueueAtom);
  const dispatchNotification = useSetAtom(dispatchToastNotificationAtom);
  const filterNotifications = useSetAtom(filterToastNotificationsAtom);

  const handleNotification = (
    id: string,
    notification: TransactionNotification,
    type: "error" | "success"
  ): void => {
    dispatchNotification({
      id,
      type,
      title: notification[type]?.title || "",
      description: notification[type]?.text || "",
      timeout: 5000,
    });
  };

  const handleTransaction = async (
    transaction: PreparedTransaction
  ): Promise<void> => {
    const transactionId = transaction.encodedTx.hash();
    let notificationType: "success" | "error" = "success";

    try {
      await broadcastTx(transaction);
      // TODO: this is dismissing all notifications, we should dismiss by some criterea
      filterNotifications((notification) => notification.type !== "pending");
    } catch (err) {
      notificationType = "error";
    }

    if (transaction.notification) {
      handleNotification(
        transactionId,
        transaction.notification,
        notificationType
      );
    }
  };

  useEffect(() => {
    if (transactions.length > 0) {
      transactions.forEach((transaction) => handleTransaction(transaction));
      clearTransactions();
    }
  }, [transactions]);
};
