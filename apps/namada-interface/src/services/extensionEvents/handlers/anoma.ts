import { Dispatch } from "react";

import { chains } from "@anoma/chains";
import { Anoma } from "@anoma/integrations";

import { addAccounts, fetchBalances } from "slices/accounts";

export const AnomaAccountChangedHandler =
  (dispatch: Dispatch<unknown>, integration: Anoma) =>
  async (event: CustomEventInit) => {
    const chainId = event.detail?.chainId;
    const chain = chains[chainId];

    if (chain.extension.id === "anoma") {
      const accounts = (await integration.accounts()) || [];

      dispatch(addAccounts(accounts));
      dispatch(fetchBalances());
    }
  };
