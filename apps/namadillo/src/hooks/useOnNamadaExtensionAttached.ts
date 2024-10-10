import { useEffectSkipFirstRender } from "@namada/hooks";
import {
  Namada,
  useIntegration,
  useUntilIntegrationAttached,
} from "@namada/integrations";
import { chainParametersAtom } from "atoms/chain";
import { namadaExtensionConnectionStatus } from "atoms/settings";
import { useAtomValue, useSetAtom } from "jotai";

export const useOnNamadaExtensionAttached = (): void => {
  const setNamadExtensionStatus = useSetAtom(namadaExtensionConnectionStatus);
  const chainParams = useAtomValue(chainParametersAtom);
  const attachStatus = useUntilIntegrationAttached();
  const integration = useIntegration("namada") as Namada;

  useEffectSkipFirstRender(() => {
    (async () => {
      if (attachStatus === "attached" && chainParams.data?.chainId) {
        if (!!(await integration.isConnected(chainParams.data.chainId))) {
          setNamadExtensionStatus("connected");
        }
      }
    })();
  }, [attachStatus]);
};
