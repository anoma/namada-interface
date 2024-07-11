import { CurrencyType } from "@namada/utils";
import { indexerRpcUrlAtom } from "atoms/chain";
import { Getter, Setter, atom } from "jotai";
import { atomWithQuery } from "jotai-tanstack-query";
import { atomWithStorage } from "jotai/utils";
import { SettingsStorage } from "types";
import { fetchDefaultTomlConfig, isApiAlive } from "./services";

export type ConnectStatus = "idle" | "connecting" | "connected" | "error";

export const namadaExtensionConnectionStatus = atom<ConnectStatus>("idle");

export const namadaExtensionConnectedAtom = atom<boolean>(
  (get) => get(namadaExtensionConnectionStatus) === "connected"
);

export const defaultServerConfigAtom = atomWithQuery((_get) => {
  return {
    queryKey: ["server-config"],
    staleTime: Infinity,
    retry: false,
    queryFn: async () => fetchDefaultTomlConfig(),
  };
});

export const defaultSettings = {
  version: "0.1",
  fiat: "usd",
  hideBalances: false,
  indexerUrl: "",
  signArbitraryEnabled: false,
};

export const settingsAtom = atomWithStorage<SettingsStorage>(
  "namadillo:settings",
  defaultSettings,
  undefined,
  { getOnInit: true }
);

const changeSettings =
  <T>(key: keyof SettingsStorage) =>
  (get: Getter, set: Setter, value: T) => {
    const settings = get(settingsAtom);
    set(settingsAtom, { ...settings, [key]: value });
  };

export const selectedCurrencyAtom = atom(
  (get) => get(settingsAtom).fiat,
  changeSettings<CurrencyType>("fiat")
);

export const hideBalancesAtom = atom(
  (get) => get(settingsAtom).hideBalances,
  changeSettings<boolean>("hideBalances")
);

/**
 * Returns RPC Url.
 * Priority: user defined RPC Url > TOML config > indexer RPC url
 */
export const rpcUrlAtom = atom((get) => {
  const userDefinedRpc = get(settingsAtom).rpcUrl;
  if (userDefinedRpc) return userDefinedRpc;

  const tomlRpc = get(defaultServerConfigAtom).data?.rpc_url;
  if (tomlRpc) return tomlRpc;

  const indexerRpc = get(indexerRpcUrlAtom).data;
  if (indexerRpc) return indexerRpc;

  return "";
}, changeSettings<string>("rpcUrl"));

/**
 * Returns Indexer url
 * Priority: user defined indexer URL > TOML config
 */
export const indexerUrlAtom = atom((get) => {
  const customIndexerUrl = get(settingsAtom).indexerUrl;
  if (customIndexerUrl) return customIndexerUrl;

  const tomlIndexerUrl = get(defaultServerConfigAtom).data?.indexer_url;
  if (tomlIndexerUrl) return tomlIndexerUrl;

  return "";
}, changeSettings<string>("indexerUrl"));

export const signArbitraryEnabledAtom = atom(
  (get) => get(settingsAtom).signArbitraryEnabled,
  changeSettings<boolean>("signArbitraryEnabled")
);

export const indexerHeartbeatAtom = atomWithQuery((get) => {
  const indexerUrl = get(indexerUrlAtom);
  return {
    queryKey: ["indexer-heartbeat", indexerUrl],
    enabled: !!indexerUrl,
    retry: false,
    queryFn: async () => {
      const valid = await isApiAlive(indexerUrl);
      if (!valid) throw "Unable to verify indexer heartbeat";
      return true;
    },
  };
});
