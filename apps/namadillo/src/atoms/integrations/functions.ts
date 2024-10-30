import { Asset, AssetList, Chain } from "@chain-registry/types";
import { Coin } from "@cosmjs/launchpad";
import { QueryClient, setupIbcExtension } from "@cosmjs/stargate";
import { Tendermint34Client } from "@cosmjs/tendermint-rpc";
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
import { AssetWithBalanceMap, ChainRegistryEntry } from "types";

const mainnetChains: ChainRegistryEntry[] = [
  celestia,
  cosmos,
  dydx,
  osmosis,
  stargaze,
];

const testnetChains: ChainRegistryEntry[] = [
  cosmosTestnet,
  celestiaTestnet,
  dydxTestnet,
  osmosisTestnet,
  stargazeTestnet,
];

const mainnetAndTestnetChains = [...mainnetChains, ...testnetChains];

export const getKnownChains = (
  includeTestnets?: boolean
): ChainRegistryEntry[] => {
  return includeTestnets ? mainnetAndTestnetChains : mainnetChains;
};

const ibcAddressToDenom = async (
  rpc: string,
  address: string
): Promise<string> => {
  const tmClient = await Tendermint34Client.connect(rpc);
  const queryClient = new QueryClient(tmClient);
  const ibcExtension = setupIbcExtension(queryClient);
  const ibcHash = address.replace("ibc/", "");

  const { denomTrace } = await ibcExtension.ibc.transfer.denomTrace(ibcHash);

  if (typeof denomTrace === "undefined") {
    throw new Error("Couldn't get denom trace from IBC address");
  }

  return denomTrace.path + "/" + denomTrace.baseDenom;
};

export const mapCoinsToAssets = async (
  coins: Coin[],
  assetList: AssetList,
  rpc: string
): Promise<AssetWithBalanceMap> => {
  const coinToAsset = async ({ denom }: Coin): Promise<Asset> => {
    const registryAsset = assetList.assets.find(
      (asset) => asset.base === denom
    );

    if (registryAsset) {
      return registryAsset;
    }

    const decodedDenom =
      denom.startsWith("ibc/") ? await ibcAddressToDenom(rpc, denom) : denom;

    return {
      denom_units: [
        {
          denom,
          exponent: 0,
        },
      ],
      base: denom,
      name: decodedDenom,
      display: denom,
      symbol: decodedDenom,
    };
  };

  const assets = coins.map(
    async (coin): Promise<[string, AssetWithBalance]> => {
      const asset = await coinToAsset(coin);

      return [
        asset.base,
        {
          asset,
          balance: BigNumber(coin.amount || 0),
        },
      ];
    }
  );

  return Object.fromEntries(await Promise.all(assets));
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
