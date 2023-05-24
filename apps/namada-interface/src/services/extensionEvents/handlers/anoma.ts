import { Dispatch } from "react";

import { chains } from "@anoma/chains";
import { Anoma } from "@anoma/integrations";

import { addAccounts, fetchBalances } from "slices/accounts";
import { actions as notificationsActions } from "slices/notifications";
import { getToast, Toasts } from "slices/transfers";

export const AnomaAccountChangedHandler =
  (dispatch: Dispatch<unknown>, integration: Anoma) =>
  async (event: CustomEventInit) => {
    const chainId = event.detail?.chainId;
    const chain = chains[chainId];

    if (chain.extension.id === "anoma") {
      const accounts = (await integration.accounts()) || [];

      dispatch(addAccounts(accounts));
      dispatch(fetchBalances());
    }
  };

export const AnomaTransferStartedHandler =
  (dispatch: Dispatch<unknown>) => async (event: CustomEventInit) => {
    dispatch(
      notificationsActions.createToast(
        getToast(`${event.detail.msgId}-transfer`, Toasts.TransferStarted)()
      )
    );
  };

export const AnomaTransferCompletedHandler =
  (dispatch: Dispatch<unknown>) => async (event: CustomEventInit) => {
    dispatch(
      notificationsActions.createToast(
        getToast(`${event.detail.msgId}-transfer`, Toasts.TransferCompleted)()
      )
    );
  };
