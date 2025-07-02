import { namadaRegistryChainAssetsMapAtom } from "atoms/integrations";
import { queryDependentFn } from "atoms/utils";
import * as osmosis from "chain-registry/mainnet/osmosis";
import { atomWithQuery } from "jotai-tanstack-query";
import { fetchTokenPrices } from "./functions";

export const tokenPricesAtom = atomWithQuery((get) => {
  const namadaChainAssetsMap = get(namadaRegistryChainAssetsMapAtom);

  return {
    queryKey: ["token-prices"],
    ...queryDependentFn(async () => {
      return fetchTokenPrices(
        Object.values(namadaChainAssetsMap.data!),
        osmosis.assets.assets
      );
    }, [namadaChainAssetsMap]),
  };
});
