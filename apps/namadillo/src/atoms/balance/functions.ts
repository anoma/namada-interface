import { Asset, AssetList } from "@chain-registry/types";
import { IbcToken, NativeToken } from "@namada/indexer-client";
import { mapCoinsToAssets } from "atoms/integrations";
import BigNumber from "bignumber.js";
import { DenomTrace } from "cosmjs-types/ibc/applications/transfer/v1/transfer";
import { namadaAsset } from "registry/namadaAsset";
import { AddressWithAssetAndBalanceMap } from "types";
import { TokenBalance } from "./atoms";

// TODO upgrade this function to be as smart as possible
// please refer to `tryCoinToIbcAsset` and how we could combine both
export const findAssetByToken = (
  token: NativeToken | IbcToken,
  chains: AssetList[]
): Asset | undefined => {
  if ("trace" in token) {
    for (let i = 0; i < chains.length; i++) {
      for (let j = 0; j < chains[i].assets.length; j++) {
        const asset = chains[i].assets[j];
        if (asset.traces) {
          for (let k = 0; k < asset.traces.length; k++) {
            const trace = asset.traces[k];
            if (
              "chain" in trace &&
              trace.chain &&
              "path" in trace.chain &&
              trace.chain.path === token.trace
            ) {
              return asset;
            }
          }
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
  list?.find((i) => i.asset.base === namadaAsset.base)?.balance ??
  new BigNumber(0);

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
  chainName: string
): Promise<AddressWithAssetAndBalanceMap> => {
  const coins = balances.map(({ address, amount }) => ({
    denom: address,
    amount: amount.toString(), // TODO: don't convert back to string
  }));

  return await mapCoinsToAssets(coins, chainName, (tnamAddress) =>
    Promise.resolve(tnamAddressToDenomTrace(tnamAddress, tokenAddresses))
  );
};

export const mapNamadaAssetsToTokenBalances = (
  assets: AddressWithAssetAndBalanceMap,
  tokenPrices: Record<string, BigNumber>
): TokenBalance[] => {
  return Object.values(assets).map((assetEntry) => {
    const tokenPrice = tokenPrices[assetEntry.address];
    const dollar =
      tokenPrice ? assetEntry.balance.multipliedBy(tokenPrice) : undefined;

    return {
      ...assetEntry,
      dollar,
    };
  });
};
