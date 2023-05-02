import { Dispatch } from "react";

import { chains } from "@anoma/chains";
import { Anoma } from "@anoma/integrations";

import { addAccounts, fetchBalances } from "slices/accounts";

export const AnomaAccountChangedHandler =
  (dispatch: Dispatch<unknown>) => async (event: CustomEventInit) => {
    const chainId = event.detail?.chainId;
    const chain = chains[chainId];

    if (chain.extension.id === "anoma") {
      const integration = new Anoma(chain);
      await integration.connect();

      const accounts = (await integration.accounts()) || [];

      dispatch(addAccounts(accounts));
      dispatch(fetchBalances());
    }
  };
