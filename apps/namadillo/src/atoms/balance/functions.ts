import { IbcToken, NativeToken } from "@anomaorg/namada-indexer-client";
import { Asset, AssetList } from "@chain-registry/types";
import BigNumber from "bignumber.js";
import { namadaAsset } from "registry/namadaAsset";
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
