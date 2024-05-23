import { useAtomValue, useSetAtom } from "jotai";

import { useEffectSkipFirstRender } from "@namada/hooks";
import {
  Namada,
  useIntegration,
  useUntilIntegrationAttached,
} from "@namada/integrations";
import { namadaExtensionConnectedAtom } from "slices/settings";

import { useEffect } from "react";
import { fetchAccountsAtom, fetchDefaultAccountAtom } from "slices/accounts";
import { chainAtom } from "slices/chain";
import { isRevealPkNeededAtom, minimumGasPriceAtom } from "slices/fees";

export const useOnChainChanged = (): void => {
  const chain = useAtomValue(chainAtom);
  useAtomValue(minimumGasPriceAtom);
  const refreshPublicKeys = useSetAtom(isRevealPkNeededAtom);

  useEffectSkipFirstRender(() => {
    refreshPublicKeys();
  }, [chain]);
};

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

export const useOnNamadaExtensionConnected = (): void => {
  const connected = useAtomValue(namadaExtensionConnectedAtom);
  const fetchAccounts = useSetAtom(fetchAccountsAtom);
  const fetchDefaultAccount = useSetAtom(fetchDefaultAccountAtom);

  useEffect(() => {
    if (connected) {
      fetchAccounts();
      fetchDefaultAccount();
    }
  }, [connected]);
};
