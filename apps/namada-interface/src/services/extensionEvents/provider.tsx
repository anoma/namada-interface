import { createContext } from "react";

import { Events } from "@anoma/types";
import { chains, defaultChainId } from "@anoma/chains";
import { Anoma, Keplr } from "@anoma/integrations";
import { useEventListenerOnce, useIntegration } from "@anoma/hooks";

import { useAppDispatch } from "store";
import {
  AnomaAccountChangedHandler,
  AnomaTransferCompletedHandler,
  AnomaTransferStartedHandler,
  AnomaUpdatedBalancesHandler,
} from "./handlers/anoma";
import { KeplrAccountChangedHandler } from "./handlers";

export const ExtensionEventsContext = createContext({});

export const ExtensionEventsProvider: React.FC = (props): JSX.Element => {
  const dispatch = useAppDispatch();
  const anomaIntegration = useIntegration(defaultChainId);
  // TODO: Don't hardcode chain id here!
  const keplrIntegration = useIntegration("cosmoshub-4");

  // Instantiate handlers:
  const anomaAccountChangedHandler = AnomaAccountChangedHandler(
    dispatch,
    anomaIntegration as Anoma
  );
  const anomaTransferStartedHandler = AnomaTransferStartedHandler(dispatch);
  const anomaTransferCompletedHandler = AnomaTransferCompletedHandler(dispatch);
  const anomaUpdatedBalancesHandler = AnomaUpdatedBalancesHandler(dispatch);

  // Keplr handlers
  const keplrAccountChangedHandler = KeplrAccountChangedHandler(
    dispatch,
    keplrIntegration as Keplr
  );

  // Register handlers:
  useEventListenerOnce(Events.AccountChanged, anomaAccountChangedHandler);
  useEventListenerOnce(Events.TransferStarted, anomaTransferStartedHandler);
  useEventListenerOnce(Events.TransferCompleted, anomaTransferCompletedHandler);
  useEventListenerOnce(Events.UpdatedBalances, anomaUpdatedBalancesHandler);
  useEventListenerOnce("keplr_keystorechange", keplrAccountChangedHandler);

  return (
    <ExtensionEventsContext.Provider value={{}}>
      {props.children}
    </ExtensionEventsContext.Provider>
  );
};
