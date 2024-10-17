import { AssetList, Chain } from "@chain-registry/types";
import { Coin } from "@cosmjs/launchpad";
import BigNumber from "bignumber.js";
import * as celestia from "chain-registry/mainnet/celestia";
import * as cosmos from "chain-registry/mainnet/cosmoshub";
import * as dydx from "chain-registry/mainnet/dydx";
import * as osmosis from "chain-registry/mainnet/osmosis";
import * as stargaze from "chain-registry/mainnet/stargaze";
import * as celestiaTestnet from "chain-registry/testnet/celestiatestnet3";
import * as cosmosTestnet from "chain-registry/testnet/cosmoshubtestnet";
import * as dydxTestnet from "chain-registry/testnet/dydxtestnet";
import * as osmosisTestnet from "chain-registry/testnet/osmosistestnet4";
import * as stargazeTestnet from "chain-registry/testnet/stargazetestnet";
import { ChainRegistryEntry } from "types";
import { AssetWithBalance } from "./services";

const mainnetChains: Record<string, ChainRegistryEntry> = {
  [celestia.chain.chain_id]: celestia,
  [cosmos.chain.chain_id]: cosmos,
  [dydx.chain.chain_id]: dydx,
  [osmosis.chain.chain_id]: osmosis,
  [stargaze.chain.chain_id]: stargaze,
};

const testnetChains: Record<string, ChainRegistryEntry> = {
  [cosmosTestnet.chain.chain_id]: cosmosTestnet,
  [celestiaTestnet.chain.chain_id]: celestiaTestnet,
  [dydxTestnet.chain.chain_id]: dydxTestnet,
  [osmosisTestnet.chain.chain_id]: osmosisTestnet,
  [stargazeTestnet.chain.chain_id]: stargazeTestnet,
};

export const getKnownChains = (
  includeTestnets?: boolean
): Record<string, ChainRegistryEntry> => {
  return includeTestnets ?
      { ...mainnetChains, ...testnetChains }
    : mainnetChains;
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

export const getRpcByIndex = (chain: Chain, index = 0): string => {
  const availableRpcs = chain.apis?.rpc;
  if (!availableRpcs) {
    throw new Error("There are no available RPCs for " + chain.chain_name);
  }
  const randomRpc = availableRpcs[Math.min(index, availableRpcs.length - 1)];
  return randomRpc.address;
};

export const getRestApiAddressByIndex = (chain: Chain, index = 0): string => {
  const availableRestApis = chain.apis?.rest;
  if (!availableRestApis) {
    throw new Error("There are no available Rest APIs for " + chain.chain_name);
  }
  const randomRestApi =
    availableRestApis[Math.min(index, availableRestApis.length - 1)];
  return randomRestApi.address;
};
