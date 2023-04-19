import { createContext, Dispatch } from "react";

import { Chain } from "@anoma/types";
import { chains } from "@anoma/chains";
import { Anoma } from "@anoma/integrations";

import { useEventListenerOnce } from "hooks";
import { useIntegration } from "services";
import { addAccounts } from "slices/accounts";
import { useAppDispatch, useAppSelector } from "store";
import { SettingsState } from "slices/settings";

const AccountChangedHandler =
  (
    dispatch: Dispatch<unknown>,
    integration: Anoma,
    chain: Chain,
    isConnected: boolean
  ) =>
  async () => {
    // Only reload accounts if Namada accounts are displayed:
    if (isConnected && chain.extension.id === "anoma") {
      const accounts = await integration?.accounts();
      if (accounts) {
        dispatch(addAccounts(accounts));
      }
    }
  };

export const ExtensionEventsContext = createContext({});

export const ExtensionEventsProvider: React.FC = (props): JSX.Element => {
  const dispatch = useAppDispatch();
  const { chainId, connectedChains } = useAppSelector<SettingsState>(
    (state) => state.settings
  );
  const chain = chains[chainId];
  const integration = useIntegration(chainId);
  const isConnected = connectedChains.indexOf(chainId) > -1;

  const accountChangedHandler = AccountChangedHandler(
    dispatch,
    integration as Anoma,
    chain,
    isConnected
  );

  useEventListenerOnce("anoma_account_changed", accountChangedHandler);

  return (
    <ExtensionEventsContext.Provider value={{}}>
      {props.children}
    </ExtensionEventsContext.Provider>
  );
};
