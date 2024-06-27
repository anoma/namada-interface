import { useEffectSkipFirstRender } from "@namada/hooks";
import {
  Namada,
  useIntegration,
  useUntilIntegrationAttached,
} from "@namada/integrations";
import { useSetAtom } from "jotai";
import { namadaExtensionConnectionStatus } from "slices/settings";

export const useOnNamadaExtensionAttached = (): void => {
  const setNamadExtensionStatus = useSetAtom(namadaExtensionConnectionStatus);
  const attachStatus = useUntilIntegrationAttached();
  const integration = useIntegration("namada") as Namada;

  useEffectSkipFirstRender(() => {
    (async () => {
      if (attachStatus === "attached") {
        if (!!(await integration.isConnected())) {
          setNamadExtensionStatus("connected");
        }
      }
    })();
  }, [attachStatus]);
};
