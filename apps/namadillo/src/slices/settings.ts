import { CurrencyType } from "@namada/utils";
import { Getter, Setter, atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

type SettingsStorage = {
  version: string;
  fiat: CurrencyType;
  hideBalances: boolean;
  rpcUrl: string;
  indexerUrl: string;
  chainId: string;
  nativeToken: string;
  signArbitraryEnabled: boolean;
};

export type ConnectStatus = "idle" | "connecting" | "connected" | "error";

export const namadaExtensionConnectionStatus = atom<ConnectStatus>("idle");
export const namadaExtensionConnectedAtom = atom<boolean>(
  (get) => get(namadaExtensionConnectionStatus) === "connected"
);

export const namadilloSettingsAtom = atomWithStorage<SettingsStorage>(
  "namadillo:settings",
  {
    version: "0.1",
    fiat: "usd",
    hideBalances: false,
    rpcUrl: process.env.NAMADA_INTERFACE_NAMADA_URL || "",
    indexerUrl: process.env.NAMADA_INTERFACE_INDEXER_URL || "",
    chainId: process.env.NAMADA_INTERFACE_NAMADA_CHAIN_ID || "",
    nativeToken: process.env.NAMADA_INTERFACE_NAMADA_TOKEN || "",
    signArbitraryEnabled: false,
  },
  undefined,
  { getOnInit: true }
);

const changeSettings =
  <T>(key: keyof SettingsStorage) =>
  (get: Getter, set: Setter, value: T) => {
    const settings = get(namadilloSettingsAtom);
    set(namadilloSettingsAtom, { ...settings, [key]: value });
  };

export const selectedCurrencyAtom = atom(
  (get) => get(namadilloSettingsAtom).fiat,
  changeSettings<CurrencyType>("fiat")
);

export const hideBalancesAtom = atom(
  (get) => get(namadilloSettingsAtom).hideBalances,
  changeSettings<boolean>("hideBalances")
);

export const rpcUrlAtom = atom(
  (get) => get(namadilloSettingsAtom).rpcUrl,
  changeSettings<string>("rpcUrl")
);

export const indexerUrlAtom = atom(
  (get) => get(namadilloSettingsAtom).indexerUrl,
  changeSettings<string>("indexerUrl")
);

export const chainIdAtom = atom(
  (get) => get(namadilloSettingsAtom).chainId,
  changeSettings<string>("chainId")
);

export const nativeTokenAtom = atom(
  (get) => get(namadilloSettingsAtom).nativeToken,
  changeSettings<string>("nativeToken")
);

export const signArbitraryEnabledAtom = atom(
  (get) => get(namadilloSettingsAtom).signArbitraryEnabled,
  changeSettings<boolean>("signArbitraryEnabled")
);
