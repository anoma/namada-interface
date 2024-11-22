import { AssetList, Chain } from "@chain-registry/types";
import internalDevnetAssets from "namada-chain-registry/namadainternaldevnet/assetlist.json";
import internalDevnetChain from "namada-chain-registry/namadainternaldevnet/chain.json";

export const namadaLocal = (chainId: string): Chain => ({
  ...internalDevnetChain,
  chain_name: "localnet",
  chain_id: chainId,
});

export const namadaLocalAsset = (tokenAddress: string): AssetList => ({
  ...internalDevnetAssets,
  chain_name: "localnet",
  assets: internalDevnetAssets.assets.map((asset) =>
    asset.name === "NAM" ?
      {
        ...asset,
        address: tokenAddress,
      }
    : asset
  ),
});
