import { Asset } from "@chain-registry/types";
import { assetBalanceAtomFamily } from "atoms/integrations";
import BigNumber from "bignumber.js";
import invariant from "invariant";
import { useAtomValue } from "jotai";
import { useMemo } from "react";
import { ChainRegistryEntry } from "types";

type useAmountTransferProps = {
  registry?: ChainRegistryEntry;
  asset?: Asset;
  walletAddress?: string;
};

type UseAmountTransferOutput = {
  isLoading: boolean;
  balance: BigNumber | undefined;
  availableAssets?: Asset[];
  assetsBalances?: { asset: Asset; minDenomAmount: BigNumber }[];
};

export const useAssetAmount = ({
  registry,
  asset,
  walletAddress,
}: useAmountTransferProps): UseAmountTransferOutput => {
  const { data: assetsBalances, isLoading } = useAtomValue(
    assetBalanceAtomFamily({
      chain: registry?.chain,
      assets: registry?.assets,
      walletAddress,
    })
  );

  const balance = useMemo<BigNumber | undefined>(() => {
    if (!asset || !assetsBalances) {
      return undefined;
    }
    const assetBalance = assetsBalances.find(
      (ab) => ab.asset.base === asset.base
    );
    invariant(assetBalance, "Asset balance not found");
    return assetBalance.minDenomAmount;
  }, [asset, assetsBalances]);

  const availableAssets = useMemo<Asset[] | undefined>(() => {
    if (!assetsBalances) return undefined;
    return Object.values(assetsBalances).map((el) => el.asset) || [];
  }, [assetsBalances]);

  return {
    isLoading,
    balance,
    assetsBalances,
    availableAssets,
  };
};
