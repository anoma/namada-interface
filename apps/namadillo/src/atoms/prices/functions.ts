import { getIbcAssetByNamadaAsset } from "atoms/integrations";
import BigNumber from "bignumber.js";
import { Address, Asset, BaseDenom, NamadaAsset } from "types";
import { fetchCoinPrices } from "./services";

export const fetchTokenPrices = async (
  tokenAddressToFetch: Address[],
  namadaAssets: NamadaAsset[],
  osmosisAssets: Asset[]
): Promise<Record<Address, BigNumber>> => {
  const baseMap: Record<BaseDenom, Address[]> = {};
  tokenAddressToFetch.forEach((address) => {
    const token = namadaAssets?.find((t) => t.address === address);
    if (token) {
      // searching only on osmosis because these are the assets supported by fetchCoinPrices
      const asset = getIbcAssetByNamadaAsset(token, osmosisAssets);
      if (asset) {
        if (baseMap[asset.base]) {
          baseMap[asset.base].push(address);
        } else {
          baseMap[asset.base] = [address];
        }
      }
    }
  });
  const baseList = Object.keys(baseMap);
  const apiResponse = await fetchCoinPrices(baseList);

  const tokenPrices: Record<string, BigNumber> = {};
  Object.entries(apiResponse).forEach(([base, value]) => {
    const dollar = Object.values(value)[0];
    if (dollar) {
      baseMap[base].forEach((address) => {
        tokenPrices[address] = new BigNumber(dollar);
      });
    }
  });
  return tokenPrices;
};
