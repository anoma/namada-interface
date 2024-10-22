import { Asset } from "@chain-registry/types";
import { assetBalanceAtomFamily } from "atoms/integrations";
import BigNumber from "bignumber.js";
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
  availableAssets: Asset[];
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
    return assetsBalances[asset.base].balance;
  }, [asset, assetsBalances]);

  const availableAssets = useMemo<Asset[]>(() => {
    return Object.values(assetsBalances || {}).map((el) => el.asset) || [];
  }, [assetsBalances]);

  return {
    isLoading,
    balance,
    availableAssets,
  };
};
