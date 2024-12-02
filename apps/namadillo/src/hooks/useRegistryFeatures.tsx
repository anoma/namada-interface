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
  : "https://raw.githubusercontent.com/anoma/namada-chain-registry/refs/heads/main";

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

  if (!enabledFeatures || enabledFeatures.length === 0) {
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
