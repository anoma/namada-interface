import { ChainKey } from "@namada/types";
import { CurrencyType } from "@namada/utils";
import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

export const namadaExtensionConnectedAtom = atom(false);

export const selectedCurrencyAtom = atomWithStorage<CurrencyType>(
  "namadillo:fiat",
  "usd"
);

export const hideBalancesAtom = atomWithStorage(
  "namadillo:hideBalances",
  false
);

export const connectedChainsAtom = atom<ChainKey[]>([]);

export const addConnectedChainAtom = atom(null, (get, set, chain: ChainKey) => {
  const connectedChains = get(connectedChainsAtom);
  set(
    connectedChainsAtom,
    connectedChains.includes(chain) ? connectedChains : (
      [...connectedChains, chain]
    )
  );
});
