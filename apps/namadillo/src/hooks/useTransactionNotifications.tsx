import { useEffectSkipFirstRender } from "@namada/hooks";
import { BondProps, RedelegateProps, UnbondProps } from "@namada/types";
import { shortenAddress } from "@namada/utils";
import { useSetAtom } from "jotai";
import { dispatchToastNotificationAtom } from "slices/notifications";
import { EventData, TransactionEvent } from "types/events";

export const useTransactionNotifications = (): void => {
  const dispatchNotification = useSetAtom(dispatchToastNotificationAtom);

  useEffectSkipFirstRender(() => {
    initEvents();
  }, []);

  function addEvent<T>(
    handle: TransactionEvent,
    callback: (e: EventData<T>) => void
  ): void {
    window.addEventListener(handle, callback as EventListener, false);
  }

  function initEvents(): void {
    addEvent("Bond.Error", (e: EventData<BondProps>): void => {
      const address = shortenAddress(e.detail.data.validator, 8, 8);
      dispatchNotification({
        id: e.detail.transactionId,
        type: "error",
        title: "Staking transaction failed",
        description: `Your staking transaction to ${address} has failed.`,
        timeout: 5000,
      });
    });

    addEvent("Bond.Success", (e: EventData<BondProps>): void => {
      const address = shortenAddress(e.detail.data.validator, 8, 8);
      dispatchNotification({
        id: e.detail.transactionId,
        title: "Staking transaction succeeded",
        description: `Your staking transaction of ${e.detail.data.amount} NAM to ${address} has been succeeded`,
        type: "success",
        timeout: 5000,
      });
    });

    addEvent("Unbond.Success", (e: EventData<UnbondProps>): void => {
      const address = shortenAddress(e.detail.data.validator, 8, 8);
      dispatchNotification({
        id: e.detail.transactionId,
        title: "Unstake transaction succeeded",
        description: `You've removed ${e.detail.data.amount} NAM from validator ${address}`,
        type: "success",
        timeout: 5000,
      });
    });

    addEvent("Unbond.Error", (e: EventData<UnbondProps>): void => {
      const address = shortenAddress(e.detail.data.validator, 8, 8);
      dispatchNotification({
        id: e.detail.transactionId,
        title: "Unstake transaction failed",
        description: `Your request to unstake ${e.detail.data.amount} NAM from ${address} has failed`,
        type: "success",
        timeout: 5000,
      });
    });

    addEvent("ReDelegate.Error", (e: EventData<RedelegateProps>): void => {
      const sourceAddress = shortenAddress(e.detail.data.sourceValidator);
      const destAddress = shortenAddress(e.detail.data.destinationValidator);
      dispatchNotification({
        id: e.detail.transactionId,
        title: "Re-delegate failed",
        description:
          `Your re-delegate transaction of ${e.detail.data.amount}` +
          ` NAM from ${sourceAddress} to ${destAddress} has failed`,
        type: "success",
        timeout: 5000,
      });
    });

    addEvent("ReDelegate.Success", (e: EventData<RedelegateProps>): void => {
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
    });
  }
};
