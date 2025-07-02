import { getCounterPartyAsset } from "atoms/integrations";
import BigNumber from "bignumber.js";
import { Address, Asset, NamadaAsset } from "types";
import { fetchCoinPrices } from "./services";

export const fetchTokenPrices = async (
  namadaAssets: NamadaAsset[],
  osmosisAssets: Asset[]
): Promise<Record<Address, BigNumber>> => {
  const baseAddressMap: Record<string, Address> = {};
  namadaAssets.forEach((asset) => {
    const counterPartyAsset = getCounterPartyAsset(asset, osmosisAssets);
    if (counterPartyAsset) {
      baseAddressMap[counterPartyAsset.base] = asset.address;
    }
  });
  const apiResponse = await fetchCoinPrices(Object.keys(baseAddressMap));

  const tokenPrices: Record<Address, BigNumber> = {};
  Object.entries(apiResponse).forEach(([base, value]) => {
    const dollar = Object.values(value)[0];
    if (dollar) {
      tokenPrices[baseAddressMap[base]] = new BigNumber(dollar);
    }
  });
  return tokenPrices;
};
