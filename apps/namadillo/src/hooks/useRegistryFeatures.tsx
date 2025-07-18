import { chainParametersAtom } from "atoms/chain";
import {
  ApplicationFeatures,
  applicationFeaturesAtom,
  defaultApplicationFeatures,
} from "atoms/settings";
import { useAtom, useAtomValue } from "jotai";
import { useEffect } from "react";

const { VITE_PROXY } = import.meta.env;

const namadaChainRegistryUrl =
  VITE_PROXY ?
    "http://localhost:8010/proxy"
  : "https://raw.githubusercontent.com/namada-net/namada-chain-registry/refs/heads/main";

const namadaChainRegistryMap = new Map<string, string>([
  ["namada.5f5de2dd1b88cba30586420", "namada"],
  ["housefire-alpaca.cc0d3e0c033be", "_testnets/namadahousefire"],
  ["housefire-below.0b9e6c455af037", "_testnets/namadahousefireold"],
  ["internal-devnet-45a.1881abcfec", "_testnets/namadainternaldevnet"],
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

const fetchEnabledFeatures = async (
  chainId: string
): Promise<ApplicationFeatures> => {
  const chainName = namadaChainRegistryMap.get(chainId);

  if (!chainName) {
    // Enable every feature for non-mapped chains
    return allFeaturesEnabled;
  }
  const chainConfigFile = "chain.json";

  // Initialize registry features with all disabled
  const registryFeatures = defaultApplicationFeatures;

  const response = await fetch(
    `${namadaChainRegistryUrl}/${chainName}/${chainConfigFile}`
  );

  const { features: enabledFeatures } = (await response.json()) as {
    features: Feature[];
  };

  if (!enabledFeatures) {
    // Enable every feature for non-registry chains
    return allFeaturesEnabled;
  }

  enabledFeatures.forEach((enabledFeature: Feature) => {
    switch (enabledFeature) {
      case "claimRewards":
        registryFeatures.claimRewardsEnabled = true;
        break;
      case "masp":
        registryFeatures.maspEnabled = true;
        break;
      case "ibcTransfers":
        registryFeatures.ibcTransfersEnabled = true;
        break;
      case "ibcShielding":
        registryFeatures.ibcShieldingEnabled = true;
        break;
      case "namTransfers":
        registryFeatures.namTransfersEnabled = true;
        break;
      case "shieldingRewards":
        registryFeatures.shieldingRewardsEnabled = true;
        break;
    }
  });

  return registryFeatures;
};

export const useRegistryFeatures = (): void => {
  const [_features, setFeatures] = useAtom(applicationFeaturesAtom);
  const { data: chain } = useAtomValue(chainParametersAtom);
  const chainId = chain?.chainId;

  useEffect(() => {
    if (chainId) {
      fetchEnabledFeatures(chainId).then((enabledFeatures) => {
        setFeatures(enabledFeatures);
      });
    }
  }, [chainId]);
};
