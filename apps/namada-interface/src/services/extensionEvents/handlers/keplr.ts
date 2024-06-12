import { Dispatch } from "react";

import { Keplr } from "@namada/integrations";

import { addAccounts, fetchBalances } from "slices/accounts";

import { actions as notificationsActions } from "slices/notifications";

export const KeplrAccountChangedHandler =
  (dispatch: Dispatch<unknown>, integration: Keplr) => async () => {
    const accounts = await integration.accounts();

    if (accounts) {
      dispatch(addAccounts(accounts));
      dispatch(fetchBalances());
    }
  };

export const KeplrBridgeTransferCompletedHandler =
  (dispatch: Dispatch<unknown>) => async (event: CustomEventInit) => {
    const msgId = (Math.random() + 1).toString(36).substring(7);
    const success = true;
    dispatch(
      notificationsActions.txCompletedToast({
        id: msgId,
        txTypeLabel: "IBC Transfer",
        success,
        error: "",
      })
    );
  };
