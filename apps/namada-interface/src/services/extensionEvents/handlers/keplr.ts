import { Dispatch } from "react";

import { chains } from "@anoma/chains";
import { Keplr } from "@anoma/integrations";

import { addAccounts, fetchBalances } from "slices/accounts";

export const KeplrAccountChangedHandler =
  (dispatch: Dispatch<unknown>, integration: Keplr) =>
  async (event: CustomEventInit) => {
    const chainId = event.detail?.chainId;
    const chain = chains[chainId];

    if (chain.extension.id === "keplr") {
      const accounts = await integration.accounts();

      if (accounts) {
        dispatch(addAccounts(accounts));
        dispatch(fetchBalances());
      }
    }
  };
