import { Asset, AssetList } from "@chain-registry/types";
import { IbcToken, NativeToken } from "@namada/indexer-client";
import { mapCoinsToAssets } from "atoms/integrations";
import BigNumber from "bignumber.js";
import { DenomTrace } from "cosmjs-types/ibc/applications/transfer/v1/transfer";
import { AddressWithAssetAndAmountMap } from "types";
import { isNamadaAsset } from "utils";
import { TokenBalance } from "./atoms";

// TODO upgrade this function to be as smart as possible
// please refer to `tryCoinToIbcAsset` and how we could combine both
export const findAssetByToken = (
  token: NativeToken | IbcToken,
  assetList: AssetList
): Asset | undefined => {
  if ("trace" in token) {
    const traceDenom = token.trace.split("/").at(-1);
    if (traceDenom) {
      for (let i = 0; i < assetList.assets.length; i++) {
        const asset = assetList.assets[i];
        if (
          asset.base === traceDenom ||
          asset.denom_units.find(
            (u) => u.denom === traceDenom || u.aliases?.includes(traceDenom)
          )
        ) {
          return asset;
        }
      }
    }
  }
  return undefined;
};

/**
 * Sum the dollar amount of a list of tokens
 * @param tokens
 * @returns The total of dollars, or `undefined` if at least one token has `dollar: undefined`
 */
export const sumDollars = (tokens: TokenBalance[]): BigNumber | undefined => {
  let sum = new BigNumber(0);
  for (let i = 0; i < tokens.length; i++) {
    const { dollar } = tokens[i];
    if (!dollar) {
      return undefined;
    }
    sum = sum.plus(dollar);
  }
  return sum;
};

export const getTotalDollar = (list?: TokenBalance[]): BigNumber | undefined =>
  sumDollars(list ?? []);

export const getTotalNam = (list?: TokenBalance[]): BigNumber =>
  list?.find((i) => isNamadaAsset(i.asset))?.amount ?? new BigNumber(0);

const tnamAddressToDenomTrace = (
  address: string,
  tokenAddresses: (NativeToken | IbcToken)[]
): DenomTrace | undefined => {
  const token = tokenAddresses.find((entry) => entry.address === address);
  const trace = token && "trace" in token ? token.trace : undefined;

  // If no trace, the token is NAM, but return undefined because we only care
  // about IBC tokens here
  if (typeof trace === "undefined") {
    return undefined;
  }

  const separatorIndex = trace.lastIndexOf("/");

  if (separatorIndex === -1) {
    return undefined;
  }

  return {
    path: trace.substring(0, separatorIndex),
    baseDenom: trace.substring(separatorIndex + 1),
  };
};

export const mapNamadaAddressesToAssets = async (
  balances: { address: string; amount: BigNumber }[],
  tokenAddresses: (NativeToken | IbcToken)[],
  chainId: string
): Promise<AddressWithAssetAndAmountMap> => {
  const coins = balances.map(({ address, amount }) => ({
    denom: address,
    amount: amount.toString(), // TODO: don't convert back to string
  }));

  return await mapCoinsToAssets(coins, chainId, (tnamAddress) =>
    Promise.resolve(tnamAddressToDenomTrace(tnamAddress, tokenAddresses))
  );
};

export const mapNamadaAssetsToTokenBalances = (
  assets: AddressWithAssetAndAmountMap,
  tokenPrices: Record<string, BigNumber>
): TokenBalance[] => {
  return Object.values(assets).map((assetEntry) => {
    const { originalAddress, asset, amount } = assetEntry;
    const tokenPrice = tokenPrices[originalAddress];
    const dollar = tokenPrice ? amount.multipliedBy(tokenPrice) : undefined;

    return {
      originalAddress,
      asset,
      amount,
      dollar,
    };
  });
};
