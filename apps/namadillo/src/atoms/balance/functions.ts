import { IbcToken, NativeToken } from "@namada/indexer-client";
import { mapCoinsToAssets } from "atoms/integrations";
import BigNumber from "bignumber.js";
import { DenomTrace } from "cosmjs-types/ibc/applications/transfer/v1/transfer";
import { AddressWithAssetAndAmountMap } from "types";
import { isNamadaAsset } from "utils";
import { TokenBalance } from "./atoms";

export const getTotalDollar = (list?: TokenBalance[]): BigNumber =>
  (list ?? []).reduce(
    (sum, { dollar }) => (dollar ? sum.plus(dollar) : sum),
    new BigNumber(0)
  );

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
