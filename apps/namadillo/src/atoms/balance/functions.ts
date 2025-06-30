import { Balance } from "@namada/indexer-client";
import { getNamadaChainAssetsMap } from "atoms/integrations";
import BigNumber from "bignumber.js";
import { Address, NamadaAssetWithAmount, TokenBalance } from "types";
import { isNamadaAsset, toDisplayAmount } from "utils";

export const getTotalDollar = (list?: TokenBalance[]): BigNumber =>
  (list ?? []).reduce(
    (sum, { dollar }) => (dollar ? sum.plus(dollar) : sum),
    new BigNumber(0)
  );

export const getTotalNam = (list?: TokenBalance[]): BigNumber =>
  list?.find((i) => isNamadaAsset(i.asset))?.amount ?? new BigNumber(0);

export const mapNamadaAddressesToAssets = ({
  balances,
}: {
  balances: Balance[];
}): Record<Address, NamadaAssetWithAmount> => {
  const namadaAssets = Object.values(getNamadaChainAssetsMap());
  const map: Record<Address, NamadaAssetWithAmount> = {};
  balances.forEach((item) => {
    const asset = namadaAssets.find(
      (asset) => asset.address === item.tokenAddress
    );

    if (asset) {
      map[item.tokenAddress] = {
        amount: toDisplayAmount(asset, BigNumber(item.minDenomAmount)),
        asset,
      };
    }
  });
  return map;
};

export const mapNamadaAssetsToTokenBalances = (
  assets: Record<Address, NamadaAssetWithAmount>,
  tokenPrices: Record<string, BigNumber>
): TokenBalance[] => {
  return Object.entries(assets).map(([address, assetEntry]) => {
    const { asset, amount } = assetEntry;
    const tokenPrice = tokenPrices[address];
    const dollar = tokenPrice ? amount.multipliedBy(tokenPrice) : undefined;

    return {
      address,
      asset,
      amount,
      dollar,
    };
  });
};
