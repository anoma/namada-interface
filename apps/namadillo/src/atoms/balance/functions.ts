import { Balance } from "@namada/indexer-client";
import { getNamadaChainRegistry } from "atoms/integrations";
import BigNumber from "bignumber.js";
import { Address, AssetWithAmount, TokenBalance } from "types";
import { isNamadaAsset, toDisplayAmount } from "utils";
import { unknownAsset } from "utils/assets";

export const getTotalDollar = (list?: TokenBalance[]): BigNumber =>
  (list ?? []).reduce(
    (sum, { dollar }) => (dollar ? sum.plus(dollar) : sum),
    new BigNumber(0)
  );

export const getTotalNam = (list?: TokenBalance[]): BigNumber =>
  list?.find((i) => isNamadaAsset(i.asset))?.amount ?? new BigNumber(0);

// TODO: move this  to somewhere else?
export const mapNamadaAddressesToAssets = ({
  balances,
}: {
  balances: Balance[];
}): Record<Address, AssetWithAmount> => {
  const namadaRegistry = getNamadaChainRegistry();
  const map: Record<Address, AssetWithAmount> = {};
  balances.forEach((item) => {
    const asset =
      namadaRegistry.assets.assets.find(
        (asset) => asset.address === item.tokenAddress
      ) ?? unknownAsset(item.tokenAddress);

    map[item.tokenAddress] = {
      amount: toDisplayAmount(asset, BigNumber(item.minDenomAmount)),
      asset,
    };
  });
  return map;
};

export const mapNamadaAssetsToTokenBalances = (
  assets: Record<Address, AssetWithAmount>,
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
