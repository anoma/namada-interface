import { namadaChainRegistryAtom } from "atoms/integrations";
import namadaAssets from "chain-registry/mainnet/namada/assets";
import * as osmosisAssets from "chain-registry/mainnet/osmosis";
import { atomWithQuery } from "jotai-tanstack-query";
import { atomFamily } from "jotai/utils";
import isEqual from "lodash.isequal";
import { Address, Asset, NamadaAsset } from "types";
import { fetchTokenPrices } from "./functions";

export const tokenPricesFamily = atomFamily(
  (addresses: Address[]) =>
    atomWithQuery((get) => {
      const chainTokens = get(namadaChainRegistryAtom).data?.assets.assets;
      return {
        queryKey: ["token-prices", addresses, chainTokens],
        queryFn: () =>
          fetchTokenPrices(
            addresses,
            namadaAssets.assets as NamadaAsset[],
            osmosisAssets.assets.assets as Asset[]
          ),
      };
    }),
  isEqual
);
