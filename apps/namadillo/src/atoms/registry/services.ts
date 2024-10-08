import { Asset, AssetList } from "@chain-registry/types";
import { Coin } from "@cosmjs/launchpad";
import { StargateClient } from "@cosmjs/stargate";
import BigNumber from "bignumber.js";

export type AssetWithBalance = {
  asset: Asset;
  balance?: BigNumber;
};

export const queryAssetBalances = async (
  owner: string,
  rpc: string
): Promise<Coin[]> => {
  const client = await StargateClient.connect(rpc);
  const balances = (await client.getAllBalances(owner)) || [];
  return balances as Coin[];
};

export const mapCoinsToAssets = (
  coins: Coin[],
  assetList: AssetList
): Record<string, AssetWithBalance> => {
  return coins.reduce((prev, current) => {
    const asset = assetList.assets.find(
      (asset) => asset.base === current.denom
    );
    if (!asset) return prev;
    return {
      ...prev,
      [asset.base]: {
        asset,
        balance: new BigNumber(current.amount || 0),
      },
    };
  }, {});
};
