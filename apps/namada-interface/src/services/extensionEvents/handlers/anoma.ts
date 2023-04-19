import { Dispatch } from "react";

import { chains } from "@anoma/chains";
import { Anoma } from "@anoma/integrations";

import { addAccounts } from "slices/accounts";

export const AnomaAccountChangedHandler =
  (dispatch: Dispatch<unknown>, integration: Anoma, isConnected: boolean) =>
  async (event: CustomEventInit) => {
    // Only reload accounts if this is a valid Namada chain,
    // and only if extension has been connected to interface:
    const chainId = event.detail?.chainId;
    const chain = chains[chainId];

    if (isConnected && chain.extension.id === "anoma") {
      const accounts = await integration?.accounts();
      if (accounts) {
        dispatch(addAccounts(accounts));
      }
    }
  };
