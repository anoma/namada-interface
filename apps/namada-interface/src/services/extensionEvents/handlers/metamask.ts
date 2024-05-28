import { Dispatch } from "react";
import { Metamask } from "@namada/integrations";
import { addAccounts, fetchBalances } from "slices/accounts";

export const MetamaskAccountChangedHandler =
  (dispatch: Dispatch<unknown>, integration: Metamask) => async () => {
    const accounts = await integration.accounts();

    if (accounts) {
      dispatch(addAccounts(accounts));
      dispatch(fetchBalances());
    }
  };

export const MetamaskBridgeTransferCompletedHandler =
  (dispatch: Dispatch<unknown>) => async () => {
    dispatch(fetchBalances());
  };
