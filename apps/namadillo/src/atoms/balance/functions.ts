import { IbcToken, NativeToken } from "@namada/indexer-client";
import { nativeTokenAddressAtom } from "atoms/chain";
import { mapCoinsToAssets } from "atoms/integrations";
import BigNumber from "bignumber.js";
import { DenomTrace } from "cosmjs-types/ibc/applications/transfer/v1/transfer";
import { getDefaultStore } from "jotai";
import { AddressWithAssetAndAmountMap } from "types";
import { isNamadaAsset } from "utils";
import { TokenBalance } from "./atoms";

const getNativeTokenAddress = (): string | undefined => {
  const { get } = getDefaultStore();
  return get(nativeTokenAddressAtom).data;
};

/**
 * Sum the dollar amount of a list of tokens
 * @param tokens
 * @returns The total of dollars, or `undefined` if at least one token has `dollar: undefined`
 */
export const sumDollars = (tokens: TokenBalance[]): BigNumber | undefined => {
  let sum = new BigNumber(0);
  for (let i = 0; i < tokens.length; i++) {
    const { dollar, originalAddress } = tokens[i];
    if (!dollar) {
      // create an exception for native token while we don't have a market price for it
      // we can safely delete this condition when osmosis api returns a native token price
      if (originalAddress === getNativeTokenAddress()) {
        continue;
      }
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
  chainTokens: (NativeToken | IbcToken)[]
): DenomTrace | undefined => {
  const token = chainTokens.find((entry) => entry.address === address);
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
  balances: { address: string; minDenomAmount: BigNumber }[],
  chainTokens: (NativeToken | IbcToken)[],
  chainId: string
): Promise<AddressWithAssetAndAmountMap> => {
  const coins = balances.map(({ address, minDenomAmount }) => ({
    denom: address,
    minDenomAmount: minDenomAmount.toString(), // TODO: don't convert back to string
  }));

  return await mapCoinsToAssets(coins, chainId, async (tnamAddress) => {
    return tnamAddressToDenomTrace(tnamAddress, chainTokens);
  });
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
