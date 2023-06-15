import { Dispatch } from "react";
import { Metamask } from "@anoma/integrations";
import { addAccounts, fetchBalances } from "slices/accounts";

export const MetamaskAccountChangedHandler =
  (dispatch: Dispatch<unknown>, integration: Metamask) => async () => {
    const accounts = await integration.accounts();

    if (accounts) {
      dispatch(addAccounts(accounts));
      dispatch(fetchBalances());
    }
  };
