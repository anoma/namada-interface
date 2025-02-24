import { Asset } from "@chain-registry/types";
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
  balances: { address: string; minDenomAmount: BigNumber }[],
  chainAssetsMap: Record<Address, Asset | undefined>
): AddressWithAssetAndAmountMap => {
  const map: AddressWithAssetAndAmountMap = {};
  balances.forEach((item) => {
    const asset = chainAssetsMap[item.address] ?? unknownAsset(item.address);
    map[item.address] = {
      originalAddress: item.address,
      amount: toDisplayAmount(asset, item.minDenomAmount),
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
