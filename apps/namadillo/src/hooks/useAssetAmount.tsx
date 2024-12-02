import { Asset } from "@chain-registry/types";
import { assetBalanceAtomFamily } from "atoms/integrations";
import BigNumber from "bignumber.js";
import { useAtomValue } from "jotai";
import { useMemo } from "react";
import { AddressWithAssetAndAmount, ChainRegistryEntry } from "types";

type useAmountTransferProps = {
  registry?: ChainRegistryEntry;
  asset?: Asset;
  walletAddress?: string;
};

type UseAmountTransferOutput = {
  isLoading: boolean;
  balance: BigNumber | undefined;
  availableAssets?: Asset[];
  assetsBalances?: Record<string, AddressWithAssetAndAmount>;
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
    return assetsBalances[asset.base].amount;
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
