import { Dispatch } from "react";

import { chains } from "@anoma/chains";
import { Metamask } from "@anoma/integrations";

import { addAccounts, fetchBalances } from "slices/accounts";

export const MetamaskAccountChangedHandler =
  (dispatch: Dispatch<unknown>, integration: Metamask) =>
  async (event: CustomEventInit) => {
    const chainId = event.detail?.chainId;
    const chain = chains[chainId];

    if (chain.extension.id === "metamask") {
      const accounts = await integration.accounts();

      if (accounts) {
        dispatch(addAccounts(accounts));
        dispatch(fetchBalances());
      }
    }
  };
