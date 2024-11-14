import { Configuration, DefaultApi } from "@namada/indexer-client";
import { isUrlValid } from "@namada/utils";
import toml from "toml";
import { SettingsTomlOptions } from "types";
import { ApplicationFeatures, defaultApplicationFeatures } from "./atoms";

const { VITE_PROXY } = process.env;
const namadaChainRegistryUrl =
  VITE_PROXY ?
    "http://localhost:8010/proxy"
  : "https://raw.githubusercontent.com/anoma/namada-chain-registry/refs/heads/main/";

const namadaChainRegistryMap = new Map<string, string>([
  ["namada-dryrun.abaaeaf7b78cb3ac", "namadadryrun"],
  ["housefire-equal.130b1076e3250f", "namadahousefire"],
  ["internal-devnet-44a.1bd3e6ca62", "namadainternaldevnet"],
]);

type Feature =
  | "claimRewards"
  | "masp"
  | "ibcTransfers"
  | "ibcShielding"
  | "shieldingRewards"
  | "namTransfers";

const allFeaturesEnabled = {
  claimRewardsEnabled: true,
  shieldingRewardsEnabled: true,
  maspEnabled: true,
  ibcTransfersEnabled: true,
  ibcShieldingEnabled: true,
  namTransfersEnabled: true,
};

export const isIndexerAlive = async (url: string): Promise<boolean> => {
  if (!isUrlValid(url)) {
    return false;
  }
  try {
    const configuration = new Configuration({ basePath: url });
    const api = new DefaultApi(configuration);
    const response = await api.healthGet();
    return response.status === 200;
  } catch {
    return false;
  }
};

export const isMaspIndexerAlive = async (url: string): Promise<boolean> => {
  if (!isUrlValid(url)) {
    return false;
  }
  try {
    const response = await fetch(`${url}/health`);
    return response.ok && response.status === 200;
  } catch {
    return false;
  }
};

export const isRpcAlive = async (url: string): Promise<boolean> => {
  if (!isUrlValid(url)) {
    return false;
  }
  try {
    const response = await fetch(`${url}/health`);
    return response.ok && response.status === 200;
  } catch {
    return false;
  }
};

export const fetchDefaultTomlConfig =
  async (): Promise<SettingsTomlOptions> => {
    const response = await fetch("/config.toml");
    return toml.parse(await response.text()) as SettingsTomlOptions;
  };

// TODO: Clean this whole thing up!
export const fetchEnabledFeatures = async (
  chainId: string
): Promise<ApplicationFeatures> => {
  const chainName = namadaChainRegistryMap.get(chainId);

  if (!chainName) {
    // Enable every feature for non-mapped chains
    return allFeaturesEnabled;
  }
  const chainConfigFile = "chain.json";

  const options = defaultApplicationFeatures;

  const response = await fetch(
    `${namadaChainRegistryUrl}/${chainName}/${chainConfigFile}`
  );

  const { features } = (await response.json()) as { features: Feature[] };

  if (!features || features.length === 0) {
    // Enable every feature for non-registry chains
    return allFeaturesEnabled;
  }

  features.forEach((feature: Feature) => {
    switch (feature) {
      case "claimRewards":
        options.claimRewardsEnabled = true;
        break;
      case "masp":
        options.maspEnabled = true;
        break;
      case "ibcTransfers":
        options.ibcTransfersEnabled = true;
        break;
      case "ibcShielding":
        options.ibcShieldingEnabled = true;
        break;
      case "namTransfers":
        options.namTransfersEnabled = true;
        break;
      case "shieldingRewards":
        options.shieldingRewardsEnabled = true;
        break;
    }
  });

  return options;
};
