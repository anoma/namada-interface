import { useAtomValue, useSetAtom } from "jotai";
import { loadable } from "jotai/utils";

import { useEffectSkipFirstRender } from "@namada/hooks";
import {
  Namada,
  useIntegration,
  useUntilIntegrationAttached,
} from "@namada/integrations";
import { namadaExtensionConnectedAtom } from "slices/settings";

import {
  accountsAtom,
  refreshAccountsAtom,
  refreshBalancesAtom,
} from "slices/accounts";
import { chainAtom } from "slices/chain";
import { isRevealPkNeededAtom, minimumGasPriceAtom } from "slices/fees";

export const useOnChainChanged = (): void => {
  const chain = useAtomValue(chainAtom);

  const refreshMinimumGasPrice = useSetAtom(minimumGasPriceAtom);
  const refreshPublicKeys = useSetAtom(isRevealPkNeededAtom);

  useEffectSkipFirstRender(() => {
    refreshMinimumGasPrice();
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

  const refreshChain = useSetAtom(chainAtom);
  const refreshAccounts = useSetAtom(refreshAccountsAtom);

  useEffectSkipFirstRender(() => {
    if (connected) {
      refreshChain();
      refreshAccounts();
    }
  }, [connected]);
};

export const useOnAccountsChanged = (): void => {
  const accountsLoadable = useAtomValue(loadable(accountsAtom));

  const refreshBalances = useSetAtom(refreshBalancesAtom);
  const refreshPublicKeys = useSetAtom(isRevealPkNeededAtom);

  useEffectSkipFirstRender(() => {
    if (accountsLoadable.state === "hasData") {
      refreshBalances();
      refreshPublicKeys();
    }
  }, [accountsLoadable]);
};
