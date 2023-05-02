import { Dispatch } from "react";

import { chains } from "@anoma/chains";
import { Anoma } from "@anoma/integrations";

import { addAccounts } from "slices/accounts";

export const AnomaAccountChangedHandler =
  (dispatch: Dispatch<unknown>) => async (event: CustomEventInit) => {
    const chainId = event.detail?.chainId;
    const chain = chains[chainId];
    const integration = new Anoma(chain);

    const accounts = (await integration.accounts()) || [];

    dispatch(addAccounts(accounts));
  };
