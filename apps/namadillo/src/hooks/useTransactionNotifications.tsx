import { shortenAddress } from "@namada/utils";
import { NamCurrency } from "App/Common/NamCurrency";
import { ToastErrorDescription } from "App/Common/ToastErrorDescription";
import {
  dispatchToastNotificationAtom,
  filterToastNotificationsAtom,
} from "atoms/notifications";
import { useSetAtom } from "jotai";
import { useTransactionEventListener } from "utils";

export const useTransactionNotifications = (): void => {
  const dispatchNotification = useSetAtom(dispatchToastNotificationAtom);
  const filterNotifications = useSetAtom(filterToastNotificationsAtom);

  const clearPendingNotifications = (): void => {
    filterNotifications((notification) => notification.type !== "pending");
  };

  useTransactionEventListener("Bond.Error", (e) => {
    const address = shortenAddress(e.detail.data.validator, 8, 8);
    clearPendingNotifications();
    dispatchNotification({
      id: e.detail.transactionId,
      type: "error",
      title: "Staking transaction failed",
      description: (
        <ToastErrorDescription
          basicMessage={`Your staking transaction to ${address} has failed.`}
          errorMessage={e.detail.error?.message}
        />
      ),
    });
  });

  useTransactionEventListener("Bond.Success", (e) => {
    const address = shortenAddress(e.detail.data.validator, 8, 8);
    clearPendingNotifications();
    dispatchNotification({
      id: e.detail.transactionId,
      title: "Staking transaction succeeded",
      description: (
        <>
          Your staking transaction of{" "}
          <NamCurrency amount={e.detail.data.amount} /> to {address} has
          succeeded
        </>
      ),
      type: "success",
      timeout: 5000,
    });
  });

  useTransactionEventListener("Unbond.Success", (e) => {
    const address = shortenAddress(e.detail.data.validator, 8, 8);
    clearPendingNotifications();
    dispatchNotification({
      id: e.detail.transactionId,
      title: "Unstake transaction succeeded",
      description: (
        <>
          You{"'"}ve removed <NamCurrency amount={e.detail.data.amount} /> from
          validator {address}
        </>
      ),
      type: "success",
      timeout: 5000,
    });
  });

  useTransactionEventListener("Unbond.Error", (e) => {
    const address = shortenAddress(e.detail.data.validator, 8, 8);
    clearPendingNotifications();
    dispatchNotification({
      id: e.detail.transactionId,
      title: "Unstake transaction failed",
      type: "error",
      description: (
        <ToastErrorDescription
          basicMessage={
            <>
              Your request to unstake{" "}
              <NamCurrency amount={e.detail.data.amount} /> from {address} has
              failed
            </>
          }
          errorMessage={e.detail.error?.message}
        />
      ),
    });
  });

  useTransactionEventListener("ReDelegate.Error", (e) => {
    const sourceAddress = shortenAddress(e.detail.data.sourceValidator);
    const destAddress = shortenAddress(e.detail.data.destinationValidator);
    clearPendingNotifications();
    dispatchNotification({
      id: e.detail.transactionId,
      title: "Redelegate failed",
      description: (
        <ToastErrorDescription
          basicMessage={
            <>
              Your redelegate transaction of{" "}
              <NamCurrency amount={e.detail.data.amount} /> from {sourceAddress}{" "}
              to {destAddress} has failed
            </>
          }
          errorMessage={e.detail.error?.message}
        />
      ),
      type: "error",
    });
  });

  useTransactionEventListener("ReDelegate.Success", (e) => {
    const sourceAddress = shortenAddress(e.detail.data.sourceValidator);
    const destAddress = shortenAddress(e.detail.data.destinationValidator);
    dispatchNotification({
      id: e.detail.transactionId,
      title: "Redelegate succeeded",
      description: (
        <>
          Your redelegate transaction of{" "}
          <NamCurrency amount={e.detail.data.amount} /> from {sourceAddress} to{" "}
          {destAddress} has succeeded
        </>
      ),
      type: "success",
      timeout: 5000,
    });
  });

  useTransactionEventListener("Withdraw.Success", (e) => {
    const address = shortenAddress(e.detail.data.source, 8, 8);
    clearPendingNotifications();
    dispatchNotification({
      id: e.detail.transactionId,
      title: "Withdrawal Success",
      description:
        `Your withdrawal transaction ` + ` from ${address} has succeeded`,
      type: "success",
      timeout: 5000,
    });
  });

  useTransactionEventListener("Withdraw.Error", (e) => {
    const address = shortenAddress(e.detail.data.source, 8, 8);
    clearPendingNotifications();
    dispatchNotification({
      id: e.detail.transactionId,
      title: "Withdrawal Error",
      description: (
        <ToastErrorDescription
          basicMessage={
            `Your withdrawal transaction ` + ` from ${address} has failed`
          }
          errorMessage={e.detail.error?.message}
        />
      ),
      type: "error",
    });
  });

  useTransactionEventListener("VoteProposal.Error", (e) => {
    clearPendingNotifications();
    dispatchNotification({
      id: e.detail.transactionId,
      type: "error",
      title: "Staking transaction failed",
      description: (
        <ToastErrorDescription
          basicMessage={`Your vote transaction for proposal ${e.detail.data.proposalId} has failed.`}
          errorMessage={e.detail.error?.message}
        />
      ),
    });
  });

  useTransactionEventListener("VoteProposal.Success", (e) => {
    clearPendingNotifications();
    dispatchNotification({
      id: e.detail.transactionId,
      title: "Staking transaction succeeded",
      description: `Your vote transaction for proposal ${e.detail.data.proposalId} has succeeded`,
      type: "success",
      timeout: 5000,
    });
  });
};
