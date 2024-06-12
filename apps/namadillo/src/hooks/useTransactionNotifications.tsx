import { useEffectSkipFirstRender } from "@namada/hooks";
import {
  BondProps,
  RedelegateProps,
  UnbondProps,
  VoteProposalProps,
  WithdrawProps,
} from "@namada/types";
import { shortenAddress } from "@namada/utils";
import { useSetAtom } from "jotai";
import {
  dispatchToastNotificationAtom,
  filterToastNotificationsAtom,
} from "slices/notifications";
import { EventData } from "types/events";
import { addTransactionEvent } from "utils";

export const useTransactionNotifications = (): void => {
  const dispatchNotification = useSetAtom(dispatchToastNotificationAtom);
  const filterNotifications = useSetAtom(filterToastNotificationsAtom);

  useEffectSkipFirstRender(() => {
    initEvents();
  }, []);

  const clearPendingNotifications = (): void => {
    filterNotifications((notification) => notification.type !== "pending");
  };

  function initEvents(): void {
    addTransactionEvent("Bond.Error", (e: EventData<BondProps>): void => {
      const address = shortenAddress(e.detail.data.validator, 8, 8);
      clearPendingNotifications();
      dispatchNotification({
        id: e.detail.transactionId,
        type: "error",
        title: "Staking transaction failed",
        description: `Your staking transaction to ${address} has failed.`,
        timeout: 5000,
      });
    });

    addTransactionEvent("Bond.Success", (e: EventData<BondProps>): void => {
      const address = shortenAddress(e.detail.data.validator, 8, 8);
      clearPendingNotifications();
      dispatchNotification({
        id: e.detail.transactionId,
        title: "Staking transaction succeeded",
        description: `Your staking transaction of ${e.detail.data.amount} NAM to ${address} has succeeded`,
        type: "success",
        timeout: 5000,
      });
    });

    addTransactionEvent("Unbond.Success", (e: EventData<UnbondProps>): void => {
      const address = shortenAddress(e.detail.data.validator, 8, 8);
      clearPendingNotifications();
      dispatchNotification({
        id: e.detail.transactionId,
        title: "Unstake transaction succeeded",
        description: `You've removed ${e.detail.data.amount} NAM from validator ${address}`,
        type: "success",
        timeout: 5000,
      });
    });

    addTransactionEvent("Unbond.Error", (e: EventData<UnbondProps>): void => {
      const address = shortenAddress(e.detail.data.validator, 8, 8);
      clearPendingNotifications();
      dispatchNotification({
        id: e.detail.transactionId,
        title: "Unstake transaction failed",
        description: `Your request to unstake ${e.detail.data.amount} NAM from ${address} has failed`,
        type: "success",
        timeout: 5000,
      });
    });

    addTransactionEvent(
      "ReDelegate.Error",
      (e: EventData<RedelegateProps>): void => {
        const sourceAddress = shortenAddress(e.detail.data.sourceValidator);
        const destAddress = shortenAddress(e.detail.data.destinationValidator);
        clearPendingNotifications();
        dispatchNotification({
          id: e.detail.transactionId,
          title: "Re-delegate failed",
          description:
            `Your re-delegate transaction of ${e.detail.data.amount}` +
            ` NAM from ${sourceAddress} to ${destAddress} has failed`,
          type: "success",
          timeout: 5000,
        });
      }
    );

    addTransactionEvent(
      "ReDelegate.Success",
      (e: EventData<RedelegateProps>): void => {
        const sourceAddress = shortenAddress(e.detail.data.sourceValidator);
        const destAddress = shortenAddress(e.detail.data.destinationValidator);
        dispatchNotification({
          id: e.detail.transactionId,
          title: "Re-delegate succeeded",
          description:
            `Your re-delegate transaction of ${e.detail.data.amount}` +
            ` NAM from ${sourceAddress} to ${destAddress} has succeeded`,
          type: "success",
          timeout: 5000,
        });
      }
    );

    addTransactionEvent(
      "Withdraw.Success",
      (e: EventData<WithdrawProps>): void => {
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
      }
    );

    addTransactionEvent(
      "Withdraw.Error",
      (e: EventData<WithdrawProps>): void => {
        const address = shortenAddress(e.detail.data.source, 8, 8);
        clearPendingNotifications();
        dispatchNotification({
          id: e.detail.transactionId,
          title: "Withdrawal Error",
          description:
            `Your withdrawal transaction ` + ` from ${address} has failed`,
          type: "error",
          timeout: 5000,
        });
      }
    );

    addTransactionEvent(
      "VoteProposal.Error",
      (e: EventData<VoteProposalProps>): void => {
        clearPendingNotifications();
        dispatchNotification({
          id: e.detail.transactionId,
          type: "error",
          title: "Staking transaction failed",
          description: `Your vote transaction for proposal ${e.detail.data.proposalId} has failed.`,
          timeout: 5000,
        });
      }
    );

    addTransactionEvent(
      "VoteProposal.Success",
      (e: EventData<VoteProposalProps>): void => {
        clearPendingNotifications();
        dispatchNotification({
          id: e.detail.transactionId,
          title: "Staking transaction succeeded",
          description: `Your vote transaction for proposal ${e.detail.data.proposalId} has succeeded`,
          type: "success",
          timeout: 5000,
        });
      }
    );
  }
};
