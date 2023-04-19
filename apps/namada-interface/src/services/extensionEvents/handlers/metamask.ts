import { Dispatch } from "react";

import { chains } from "@anoma/chains";
import { Metamask } from "@anoma/integrations";

import { addAccounts } from "slices/accounts";

export const MetamaskAccountChangedHandler =
  (dispatch: Dispatch<unknown>, integration: Metamask, isConnected: boolean) =>
  async (event: CustomEventInit) => {
    // TODO: What is the correct parameter for Metamask?
    const chainId = event.detail?.chainId;
    const chain = chains[chainId];

    if (isConnected && chain.extension.id === "metamask") {
      const accounts = await integration?.accounts();
      if (accounts) {
        dispatch(addAccounts(accounts));
      }
    }
  };
