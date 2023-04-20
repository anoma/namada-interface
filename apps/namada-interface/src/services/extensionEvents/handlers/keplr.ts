import { Dispatch } from "react";

import { chains } from "@anoma/chains";
import { Keplr } from "@anoma/integrations";

import { addAccounts } from "slices/accounts";

export const KeplrAccountChangedHandler =
  (
    dispatch: Dispatch<unknown>,
    integrations: Record<string, Keplr>,
    connectedChains: string[]
  ) =>
  async (event: CustomEventInit) => {
    // TODO: What is the correct parameter to respond to?
    const chainId = event.detail?.chainId;
    const chain = chains[chainId];

    if (
      connectedChains.indexOf(chainId) > -1 &&
      chain.extension.id === "keplr"
    ) {
      const accounts = await integrations[chainId]?.accounts();
      if (accounts) {
        dispatch(addAccounts(accounts));
      }
    }
  };
