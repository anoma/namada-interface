import { Namada } from "@namada/integrations";
import { Dispatch } from "react";

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
