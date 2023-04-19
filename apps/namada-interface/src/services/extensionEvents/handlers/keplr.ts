import { Dispatch } from "react";

import { chains } from "@anoma/chains";
import { Keplr } from "@anoma/integrations";

import { addAccounts } from "slices/accounts";

export const KeplrAccountChangedHandler =
  (dispatch: Dispatch<unknown>, integration: Keplr, isConnected: boolean) =>
  async (event: CustomEventInit) => {
    // TODO: What is the correct parameter for Keplr?
    const chainId = event.detail?.chainId;
    const chain = chains[chainId];

    if (isConnected && chain.extension.id === "keplr") {
      const accounts = await integration?.accounts();
      if (accounts) {
        dispatch(addAccounts(accounts));
      }
    }
  };
