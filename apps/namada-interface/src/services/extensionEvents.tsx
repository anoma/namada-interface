import { createContext, Dispatch } from "react";

import { chains } from "@anoma/chains";
import { Anoma } from "@anoma/integrations";

import { useEventListenerOnce } from "hooks";
import { useIntegration } from "services";
import { useAppDispatch, useAppSelector } from "store";
import { addAccounts } from "slices/accounts";
import { SettingsState } from "slices/settings";

const AccountChangedHandler =
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

export const ExtensionEventsContext = createContext({});

export const ExtensionEventsProvider: React.FC = (props): JSX.Element => {
  const dispatch = useAppDispatch();
  const { chainId, connectedChains } = useAppSelector<SettingsState>(
    (state) => state.settings
  );
  const integration = useIntegration(chainId);
  const isConnected = connectedChains.indexOf(chainId) > -1;

  const accountChangedHandler = AccountChangedHandler(
    dispatch,
    integration as Anoma,
    isConnected
  );

  useEventListenerOnce("anoma_account_changed", accountChangedHandler);

  return (
    <ExtensionEventsContext.Provider value={{}}>
      {props.children}
    </ExtensionEventsContext.Provider>
  );
};
