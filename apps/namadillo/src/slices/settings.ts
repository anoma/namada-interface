import { DefaultApi } from "@anomaorg/namada-indexer-client";
import { CurrencyType } from "@namada/utils";
import { Getter, Setter, atom } from "jotai";
import { atomWithQuery } from "jotai-tanstack-query";
import { atomWithStorage } from "jotai/utils";
import toml from "toml";
import { indexerRpcUrlAtom } from "./chainParameters";

type SettingsStorage = {
  version: string;
  fiat: CurrencyType;
  hideBalances: boolean;
  rpcUrl?: string;
  indexerUrl: string;
  signArbitraryEnabled: boolean;
};

type SettingsTomlOptions = {
  indexer_url?: string;
  rpc_url?: string;
};

export type ConnectStatus = "idle" | "connecting" | "connected" | "error";

export const namadaExtensionConnectionStatus = atom<ConnectStatus>("idle");

export const namadaExtensionConnectedAtom = atom<boolean>(
  (get) => get(namadaExtensionConnectionStatus) === "connected"
);

export const isValidIndexerUrl = async (url: string): Promise<boolean> => {
  try {
    const api = new DefaultApi({ basePath: url });
    const response = await api.healthGet();
    return response.status === 200;
  } catch {
    return false;
  }
};

export const defaultServerConfigAtom = atomWithQuery((_get) => {
  return {
    queryKey: ["server-config"],
    staleTime: Infinity,
    retry: false,
    queryFn: async () => {
      const response = await fetch("/config.toml");
      return toml.parse(await response.text()) as SettingsTomlOptions;
    },
  };
});

export const namadilloSettingsAtom = atomWithStorage<SettingsStorage>(
  "namadillo:settings",
  {
    version: "0.1",
    fiat: "usd",
    hideBalances: false,
    indexerUrl: process.env.NAMADA_INTERFACE_INDEXER_URL || "",
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

/**
 * Returns RPC Url.
 * Priority: user defined RPC Url > TOML config > indexer RPC url
 */
export const rpcUrlAtom = atom((get) => {
  const userDefinedRpc = get(namadilloSettingsAtom).rpcUrl;
  if (userDefinedRpc) return userDefinedRpc;

  const tomlRpc = get(defaultServerConfigAtom).data?.rpc_url;
  if (tomlRpc) return tomlRpc;

  const indexerRpc = get(indexerRpcUrlAtom).data;
  if (indexerRpc) return indexerRpc;

  throw "RPC url is not defined";
}, changeSettings<string>("rpcUrl"));

export const indexerUrlAtom = atom((get) => {
  const customIndexerUrl = get(namadilloSettingsAtom).indexerUrl;
  if (customIndexerUrl) return customIndexerUrl;

  const tomlIndexerUrl = get(defaultServerConfigAtom).data?.indexer_url;
  if (tomlIndexerUrl) return tomlIndexerUrl;

  return "";
}, changeSettings<string>("indexerUrl"));

export const signArbitraryEnabledAtom = atom(
  (get) => get(namadilloSettingsAtom).signArbitraryEnabled,
  changeSettings<boolean>("signArbitraryEnabled")
);

export const indexerHeartbeatAtom = atomWithQuery((get) => {
  const indexerUrl = get(indexerUrlAtom);
  return {
    queryKey: ["indexer-heartbeat", indexerUrl],
    enabled: !!indexerUrl,
    retry: false,
    queryFn: async () => {
      const valid = await isValidIndexerUrl(indexerUrl);
      if (!valid) throw "Unable to verify indexer heartbeat";
      return true;
    },
  };
});
