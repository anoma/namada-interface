import { IbcToken, NativeToken } from "@namada/indexer-client";
import BigNumber from "bignumber.js";
import * as osmosis from "chain-registry/mainnet/osmosis";
import { Address } from "types";
import { findAssetByToken } from "utils/assets";
import { fetchCoinPrices } from "./services";

export const fetchTokenPrices = async (
  tokenAddressToFetch: Address[],
  apiTokens: (NativeToken | IbcToken)[]
): Promise<Record<Address, BigNumber>> => {
  const baseMap: Record<string, string> = {};
  tokenAddressToFetch.forEach((address) => {
    const token = apiTokens?.find((t) => t.address === address);
    if (token) {
      // searching only on osmosis because these are the assets supported by fetchCoinPrices
      const asset = findAssetByToken(token, osmosis.assets.assets);
      if (asset) {
        baseMap[asset.base] = address;
      }
    }
  });
  const baseList = Object.keys(baseMap);
  const apiResponse = await fetchCoinPrices(baseList);

  const tokenPrices: Record<string, BigNumber> = {};
  Object.entries(apiResponse).forEach(([base, value]) => {
    const address = baseMap[base];
    const dollar = Object.values(value)[0];
    if (dollar) {
      tokenPrices[address] = new BigNumber(dollar);
    }
  });
  return tokenPrices;
};
