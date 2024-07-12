import { CurrencyType, isUrlValid } from "@namada/utils";
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

const changeSettingsUrl =
  (
    key: keyof SettingsStorage,
    healthCheck: (url: string) => Promise<boolean>
  ) =>
  async (get: Getter, set: Setter, url: string) => {
    const trimmedUrl = url.trim();
    const sanitizedUrl =
      trimmedUrl.endsWith("/") ? trimmedUrl.slice(0, -1) : url;
    if (!isUrlValid(sanitizedUrl)) {
      throw new Error("Invalid URL. The URL should starts with 'http'.");
    }
    if (await healthCheck(sanitizedUrl)) {
      changeSettings(key)(get, set, sanitizedUrl);
    } else {
      throw new Error(
        "Couldn't reach the URL. Please provide a valid Namada URL service."
      );
    }
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
export const rpcUrlAtom = atom(
  (get) => {
    const userDefinedRpc = get(settingsAtom).rpcUrl;
    if (userDefinedRpc) return userDefinedRpc;

    const tomlRpc = get(defaultServerConfigAtom).data?.rpc_url;
    if (tomlRpc) return tomlRpc;

    const indexerRpc = get(indexerRpcUrlAtom).data;
    if (indexerRpc) return indexerRpc;

    return "";
  },
  changeSettingsUrl("rpcUrl", isApiAlive)
);

/**
 * Returns Indexer url
 * Priority: user defined indexer URL > TOML config
 */
export const indexerUrlAtom = atom(
  (get) => {
    const customIndexerUrl = get(settingsAtom).indexerUrl;
    if (customIndexerUrl) return customIndexerUrl;

    const tomlIndexerUrl = get(defaultServerConfigAtom).data?.indexer_url;
    if (tomlIndexerUrl) return tomlIndexerUrl;

    return "";
  },
  changeSettingsUrl("indexerUrl", isApiAlive)
);

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
