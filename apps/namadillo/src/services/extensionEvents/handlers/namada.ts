import { Namada } from "@namada/integrations";

export const NamadaConnectionRevokedHandler =
  (
    integration: Namada,
    setNamadaExtensionConnected: (connected: boolean) => void
  ) =>
  async () => {
    const connected = !!(await integration.isConnected());
    setNamadaExtensionConnected(connected);
  };
