import { useEffectSkipFirstRender } from "@namada/hooks";
import {
  Namada,
  useIntegration,
  useUntilIntegrationAttached,
} from "@namada/integrations";
import { useAtomValue, useSetAtom } from "jotai";
import { chainAtom } from "slices/chain";
import { namadaExtensionConnectedAtom } from "slices/settings";

export const useOnNamadaExtensionAttached = (): void => {
  const setNamadaExtensionConnected = useSetAtom(namadaExtensionConnectedAtom);
  const chain = useAtomValue(chainAtom); // should always be namada
  const { namada: attachStatus } = useUntilIntegrationAttached(chain);
  const integration = useIntegration("namada") as Namada;

  useEffectSkipFirstRender(() => {
    (async () => {
      if (attachStatus === "attached") {
        const connected = !!(await integration.isConnected());
        setNamadaExtensionConnected(connected);
      }
    })();
  }, [attachStatus]);
};
