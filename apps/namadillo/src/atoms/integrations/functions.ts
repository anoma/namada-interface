import { AssetList, Chain } from "@chain-registry/types";
import { Coin } from "@cosmjs/launchpad";
import BigNumber from "bignumber.js";
import { AssetWithBalance } from "./services";

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

export const getRandomRpcAddress = (chain: Chain): string => {
  const availableRpcs = chain.apis?.rpc;
  if (!availableRpcs) {
    throw new Error("There are no available RPCs for " + chain.chain_name);
  }
  const randomRpc =
    availableRpcs[Math.floor(Math.random() * availableRpcs.length)];
  return randomRpc.address;
};
