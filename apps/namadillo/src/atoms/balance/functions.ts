import BigNumber from "bignumber.js";
import {
  Address,
  NamadaAsset,
  NamadaAssetWithAmount,
  TokenBalance,
} from "types";
import { isNamadaAsset } from "utils";

export const getTotalDollar = (list?: TokenBalance[]): BigNumber =>
  (list ?? []).reduce(
    (sum, { dollar }) => (dollar ? sum.plus(dollar) : sum),
    new BigNumber(0)
  );

export const getTotalNam = (list?: TokenBalance[]): BigNumber =>
  list?.find((i) => isNamadaAsset(i.asset))?.amount ?? new BigNumber(0);

export const mapNamadaAddressesToAssets = ({
  balances,
  assets,
}: {
  balances: { tokenAddress: Address; amount: BigNumber }[];
  assets: NamadaAsset[];
}): Record<Address, NamadaAssetWithAmount> => {
  const map: Record<Address, NamadaAssetWithAmount> = {};
  balances.forEach(({ tokenAddress, amount }) => {
    const asset = assets.find((asset) => asset.address === tokenAddress);

    if (asset) {
      map[tokenAddress] = {
        amount,
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
