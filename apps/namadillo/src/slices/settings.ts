import { CurrencyType } from "@namada/utils";
import { Getter, Setter, atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { GasRangeOption } from "types/fees";

type SettingsStorage = {
  fiat: CurrencyType;
  hideBalances: boolean;
  rpcUrl: string;
  chainId: string;
  signArbitraryEnabled: boolean;
  gasUsageOption: GasRangeOption;
};

export const namadaExtensionConnectedAtom = atom(false);

export const namadilloSettingsAtom = atomWithStorage<SettingsStorage>(
  "namadillo:settings",
  {
    fiat: "usd",
    hideBalances: false,
    rpcUrl: process.env.NAMADA_INTERFACE_NAMADA_URL || "",
    chainId: process.env.NAMADA_INTERFACE_NAMADA_CHAIN_ID || "",
    signArbitraryEnabled: false,
    gasUsageOption: "average",
  }
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

export const chainIdAtom = atom(
  (get) => get(namadilloSettingsAtom).chainId,
  changeSettings<string>("chainId")
);

export const gasUsageOptionAtom = atom(
  (get) => get(namadilloSettingsAtom).gasUsageOption,
  changeSettings<GasRangeOption>("gasUsageOption")
);

export const signArbitraryEnabledAtom = atom(
  (get) => get(namadilloSettingsAtom).signArbitraryEnabled,
  changeSettings<boolean>("signArbitraryEnabled")
);
