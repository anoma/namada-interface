import { Dispatch } from "react";

import { chains } from "@anoma/chains";
import { Anoma } from "@anoma/integrations";

import { addAccounts } from "slices/accounts";

export const AnomaAccountChangedHandler =
  (
    dispatch: Dispatch<unknown>,
    integrations: Record<string, Anoma>,
    connectedChains: string[]
  ) =>
  async (event: CustomEventInit) => {
    // Only reload accounts if this is a valid Namada chain,
    // and only if extension has been connected to interface:
    const chainId = event.detail?.chainId;
    const chain = chains[chainId];

    if (
      connectedChains.indexOf(chainId) > -1 &&
      chain.extension.id === "anoma"
    ) {
      const accounts = await integrations[chainId]?.accounts();
      if (accounts) {
        dispatch(addAccounts(accounts));
      }
    }
  };
