import { Dispatch } from "react";

import { Keplr } from "@anoma/integrations";

import { addAccounts, fetchBalances } from "slices/accounts";

export const KeplrAccountChangedHandler =
  (dispatch: Dispatch<unknown>, integration: Keplr) => async () => {
    const accounts = await integration.accounts();
    console.log("KEPLR accounts", { accounts });

    if (accounts) {
      dispatch(addAccounts(accounts));
      dispatch(fetchBalances());
    }
  };
