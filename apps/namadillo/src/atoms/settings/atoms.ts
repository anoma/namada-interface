import { CurrencyType, isUrlValid, sanitizeUrl } from "@namada/utils";
import { indexerRpcUrlAtom } from "atoms/chain";
import { Getter, Setter, atom, getDefaultStore } from "jotai";
import { atomWithMutation, atomWithQuery } from "jotai-tanstack-query";
import { atomWithStorage } from "jotai/utils";
import { SettingsStorage } from "types";
import {
  fetchDefaultTomlConfig,
  isIndexerAlive,
  isMaspIndexerAlive,
  isRpcAlive,
} from "./services";

export type ConnectStatus = "idle" | "connecting" | "connected" | "error";

export const namadaExtensionConnectionStatus = atom<ConnectStatus>("idle");

export const namadaExtensionConnectedAtom = atom<boolean>(
  (get) => get(namadaExtensionConnectionStatus) === "connected"
);

export const defaultApplicationFeatures = {
  claimRewardsEnabled: false,
  maspEnabled: false,
  ibcTransfersEnabled: false,
  ibcShieldingEnabled: false,
  shieldingRewardsEnabled: false,
  namTransfersEnabled: false,
};

export type ApplicationFeatures = typeof defaultApplicationFeatures;

export const applicationFeaturesAtom = atomWithStorage(
  "namadillo:features",
  defaultApplicationFeatures,
  undefined,
  { getOnInit: true }
);

export const defaultServerConfigAtom = atomWithQuery((_get) => {
  return {
    queryKey: ["server-config"],
    staleTime: Infinity,
    retry: false,
    queryFn: async () => fetchDefaultTomlConfig(),
  };
});

export const defaultLocalStorageProps = {
  version: "0.1",
  fiat: "usd",
  indexerUrl: "",
  signArbitraryEnabled: false,
};

export const settingsAtom = atomWithStorage<SettingsStorage>(
  "namadillo:settings",
  defaultLocalStorageProps,
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
    healthCheck: (url: string) => Promise<boolean>,
    allowEmpty = false
  ) =>
  async (inputUrl: string) => {
    const allowedEmpty = allowEmpty && inputUrl.length === 0;
    const url = allowedEmpty ? "" : sanitizeUrl(inputUrl);

    if (!allowedEmpty && !isUrlValid(url)) {
      throw new Error(
        "Invalid URL. The URL should be valid starting with 'http', 'https', 'ws', or 'wss'."
      );
    }
    if (allowedEmpty || (await healthCheck(url))) {
      const { get, set } = getDefaultStore();
      changeSettings(key)(get, set, url);
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
});

export const updateRpcUrlAtom = atomWithMutation(() => {
  return {
    mutationKey: ["update-rpc-url"],
    mutationFn: changeSettingsUrl("rpcUrl", isRpcAlive),
  };
});

export const rpcHeartbeatAtom = atomWithQuery((get) => {
  const rpcUrl = get(rpcUrlAtom);
  return {
    queryKey: ["rpc-heartbeat", rpcUrl],
    enabled: !!rpcUrl,
    retry: false,
    refetchOnWindowFocus: true,
    refetchInterval: 10_000,
    queryFn: async () => {
      const valid = await isRpcAlive(rpcUrl);
      if (!valid) throw "Unable to verify rpc heartbeat";
      return true;
    },
  };
});

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
});

export const maspIndexerUrlAtom = atom((get) => {
  const customIndexerUrl = get(settingsAtom).maspIndexerUrl;
  if (customIndexerUrl) return customIndexerUrl;

  const tomlIndexerUrl = get(defaultServerConfigAtom).data?.masp_indexer_url;
  if (tomlIndexerUrl) return tomlIndexerUrl;

  return "";
});

export const updateIndexerUrlAtom = atomWithMutation(() => {
  return {
    mutationKey: ["update-indexer-url"],
    mutationFn: changeSettingsUrl("indexerUrl", isIndexerAlive),
  };
});

export const updateMaspIndexerUrlAtom = atomWithMutation(() => {
  return {
    mutationKey: ["update-masp-indexer-url"],
    mutationFn: changeSettingsUrl("maspIndexerUrl", isMaspIndexerAlive, true),
  };
});

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
    refetchOnWindowFocus: true,
    refetchInterval: 10_000,
    queryFn: async () => {
      const valid = await isIndexerAlive(indexerUrl);
      if (!valid) throw "Unable to verify indexer heartbeat";
      return true;
    },
  };
});
