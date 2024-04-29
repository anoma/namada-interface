import { Namada } from "@namada/integrations";
import { Dispatch } from "react";
import { fetchProposals } from "slices/proposals";

export const NamadaProposalsUpdatedHandler =
  (dispatch: Dispatch<unknown>) => async () => {
    dispatch(fetchProposals());
  };

export const NamadaTxCompletedHandler =
  (_dispatch: Dispatch<unknown>, refreshPublicKeys: () => void) =>
  async (_event: CustomEventInit) => {
    refreshPublicKeys();
  };

export const NamadaConnectionRevokedHandler =
  (
    integration: Namada,
    setNamadaExtensionConnected: (connected: boolean) => void
  ) =>
  async () => {
    const connected = !!(await integration.isConnected());
    setNamadaExtensionConnected(connected);
  };
