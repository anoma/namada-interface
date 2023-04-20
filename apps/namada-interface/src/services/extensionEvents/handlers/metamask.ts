import { Dispatch } from "react";

import { chains } from "@anoma/chains";
import { Metamask } from "@anoma/integrations";

import { addAccounts } from "slices/accounts";

export const MetamaskAccountChangedHandler =
  (
    dispatch: Dispatch<unknown>,
    integrations: Record<string, Metamask>,
    connectedExtensions: string[]
  ) =>
  async (event: CustomEventInit) => {
    // TODO: What is the correct parameter to respond to?
    const chainId = event.detail?.chainId;
    const chain = chains[chainId];

    if (
      connectedExtensions.indexOf(chainId) > -1 &&
      chain.extension.id === "metamask"
    ) {
      const accounts = await integrations[chainId]?.accounts();
      if (accounts) {
        dispatch(addAccounts(accounts));
      }
    }
  };
