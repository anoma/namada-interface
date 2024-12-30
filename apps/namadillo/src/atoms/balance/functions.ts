import { IbcToken, NativeToken } from "@namada/indexer-client";
import { mapCoinsToAssets } from "atoms/integrations";
import BigNumber from "bignumber.js";
import { tnamAddressToDenomTrace } from "lib/tokens";
import { AddressWithAssetAndAmountMap, TokenBalance } from "types";

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
