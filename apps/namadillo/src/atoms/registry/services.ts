import { Asset, AssetList } from "@chain-registry/types";
import { Coin } from "@cosmjs/launchpad";
import { StargateClient } from "@cosmjs/stargate";
import BigNumber from "bignumber.js";

type AssetWithBalance = {
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
): AssetWithBalance[] => {
  const assetsWithBalances = coins.map(({ denom, amount }) => {
    const asset = assetList.assets.find((asset) => asset.base === denom);
    return {
      asset,
      balance: new BigNumber(amount || 0),
    };
  });
  return assetsWithBalances.filter((a) => !!a.asset) as AssetWithBalance[];
};
