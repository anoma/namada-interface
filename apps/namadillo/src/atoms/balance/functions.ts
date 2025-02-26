import { Asset } from "@chain-registry/types";
import { Balance } from "@namada/indexer-client";
import BigNumber from "bignumber.js";
import { Address, AddressWithAssetAndAmountMap } from "types";
import { isNamadaAsset, toDisplayAmount } from "utils";
import { unknownAsset } from "utils/assets";
import { TokenBalance } from "./atoms";

export const getTotalDollar = (list?: TokenBalance[]): BigNumber =>
  (list ?? []).reduce(
    (sum, { dollar }) => (dollar ? sum.plus(dollar) : sum),
    new BigNumber(0)
  );

export const getTotalNam = (list?: TokenBalance[]): BigNumber =>
  list?.find((i) => isNamadaAsset(i.asset))?.amount ?? new BigNumber(0);

export const mapNamadaAddressesToAssets = (
  balances: Balance[],
  chainAssetsMap: Record<Address, Asset | undefined>
): AddressWithAssetAndAmountMap => {
  const map: AddressWithAssetAndAmountMap = {};
  balances.forEach((item) => {
    const asset =
      chainAssetsMap[item.tokenAddress] ?? unknownAsset(item.tokenAddress);
    map[item.tokenAddress] = {
      originalAddress: item.tokenAddress,
      amount: toDisplayAmount(asset, BigNumber(item.minDenomAmount)),
      asset,
    };
  });
  return map;
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
