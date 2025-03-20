import { Asset, AssetList, Chain, IBCInfo } from "@chain-registry/types";
import { QueryClient, setupIbcExtension } from "@cosmjs/stargate";
import { Tendermint34Client } from "@cosmjs/tendermint-rpc";
import namadaMainnetChain from "@namada/chain-registry/namada/chain.json";
import { mapUndefined } from "@namada/utils";
import BigNumber from "bignumber.js";
import * as celestia from "chain-registry/mainnet/celestia";
import * as cosmos from "chain-registry/mainnet/cosmoshub";
import * as osmosis from "chain-registry/mainnet/osmosis";
import * as stride from "chain-registry/mainnet/stride";
import * as celestiaTestnet from "chain-registry/testnet/celestiatestnet3";
import * as cosmosTestnet from "chain-registry/testnet/cosmosicsprovidertestnet";
import * as osmosisTestnet from "chain-registry/testnet/osmosistestnet";
import { DenomTrace } from "cosmjs-types/ibc/applications/transfer/v1/transfer";
import {
  AddressWithAssetAndAmount,
  AddressWithAssetAndAmountMap,
  ChainRegistryEntry,
  Coin,
  LocalnetToml,
  RpcStorage,
} from "types";
import { toDisplayAmount } from "utils";
import { unknownAsset } from "utils/assets";

import campfireAssets from "@namada/chain-registry/_testnets/namadacampfire/assetlist.json";
import campfireChain from "@namada/chain-registry/_testnets/namadacampfire/chain.json";
import housefireAssets from "@namada/chain-registry/_testnets/namadahousefire/assetlist.json";
import housefireChain from "@namada/chain-registry/_testnets/namadahousefire/chain.json";
import housefireOldAssets from "@namada/chain-registry/_testnets/namadahousefireold/assetlist.json";
import housefireOldChain from "@namada/chain-registry/_testnets/namadahousefireold/chain.json";
import internalDevnetAssets from "@namada/chain-registry/_testnets/namadainternaldevnet/assetlist.json";
import internalDevnetChain from "@namada/chain-registry/_testnets/namadainternaldevnet/chain.json";
import namadaAssets from "@namada/chain-registry/namada/assetlist.json";
import namadaChain from "@namada/chain-registry/namada/chain.json";

import internalDevnetCosmosTestnetIbc from "@namada/chain-registry/_testnets/_IBC/namadainternaldevnet-cosmoshubtestnet.json";

// TODO: this causes a big increase on bundle size. See #1224.
import registry from "chain-registry";
import { searchNamadaTestnetByChainId } from "lib/chain";

export const namadaTestnetChainList = [
  internalDevnetChain,
  campfireChain,
  housefireChain,
  housefireOldChain,
] as Chain[];

registry.chains.push(namadaChain, ...namadaTestnetChainList);
registry.assets.push(
  internalDevnetAssets,
  campfireAssets,
  housefireAssets,
  housefireOldAssets,
  namadaAssets
);

const mainnetChains: ChainRegistryEntry[] = [celestia, cosmos, osmosis, stride];
const testnetChains: ChainRegistryEntry[] = [
  cosmosTestnet,
  celestiaTestnet,
  osmosisTestnet,
];

const mainnetAndTestnetChains = [...mainnetChains, ...testnetChains];

export const getKnownChains = (
  includeTestnets?: boolean
): ChainRegistryEntry[] => {
  return includeTestnets ? mainnetAndTestnetChains : mainnetChains;
};

export const ibcAddressToDenomTrace =
  (rpc: string) =>
  async (address: string): Promise<DenomTrace | undefined> => {
    if (!address.startsWith("ibc/")) {
      return undefined;
    }

    const tmClient = await Tendermint34Client.connect(rpc);
    const queryClient = new QueryClient(tmClient);
    const ibcExtension = setupIbcExtension(queryClient);
    const ibcHash = address.replace("ibc/", "");

    const { denomTrace } = await ibcExtension.ibc.transfer.denomTrace(ibcHash);

    if (typeof denomTrace === "undefined") {
      throw new Error("Couldn't get denom trace from IBC address");
    }

    return denomTrace;
  };

const assetLookup = (chainName: string): Asset[] | undefined =>
  registry.assets.find((chain) => chain.chain_name === chainName)?.assets;

const tryDenomToRegistryAsset = (
  denom: string,
  registryAssets: Asset[]
): Asset | undefined =>
  registryAssets.find((asset) => {
    const { base, address } = asset;
    const aliases =
      asset.denom_units.find((denomUnit) => denomUnit.denom === base)
        ?.aliases || [];

    return [base, address, ...aliases].includes(denom);
  });

// For a given chain name with a given IBC channel, look up the counterpart
// chain name that the channel corresponds to.
// For example, transfer/channel-16 on elystestnet corresponds to
// cosmoshubtestnet.
const findCounterpartChainName = (
  chainName: string,
  portId: string,
  channelId: string
): string | undefined => {
  return registry.ibc.reduce<string | undefined>((acc, curr: IBCInfo) => {
    if (typeof acc !== "undefined") {
      return acc;
    }

    const tryFindSourceChainName = (
      ourChainNumber: "chain_1" | "chain_2"
    ): string | undefined => {
      if (curr[ourChainNumber].chain_name === chainName) {
        const match = curr.channels.some((channelEntry) => {
          const { port_id, channel_id } = channelEntry[ourChainNumber];
          return port_id === portId && channel_id === channelId;
        });

        if (match) {
          const theirChainNumber =
            ourChainNumber === "chain_1" ? "chain_2" : "chain_1";

          return curr[theirChainNumber].chain_name;
        }
      }
      return undefined;
    };

    return (
      tryFindSourceChainName("chain_1") || tryFindSourceChainName("chain_2")
    );
  }, undefined);
};

const tryDenomToIbcAsset = async (
  denom: string,
  ibcAddressToDenomTrace: (address: string) => Promise<DenomTrace | undefined>,
  chainName: string
): Promise<Asset | undefined> => {
  const denomTrace = await ibcAddressToDenomTrace(denom);
  if (typeof denomTrace === "undefined") {
    return undefined;
  }

  const { path, baseDenom } = denomTrace;

  const assetOnRegistry = tryDenomToRegistryAsset(
    baseDenom,
    registry.assets.map((assetListEl) => assetListEl.assets).flat()
  );

  if (assetOnRegistry) {
    return assetOnRegistry;
  }

  // denom trace path may be something like...
  // transfer/channel-16/transfer/channel-4353
  // ...so from here walk the path to find the original chain
  const pathParts = path.split("/");
  if (pathParts.length % 2 !== 0) {
    return undefined;
  }

  const ibcChannelTrail: { portId: string; channelId: string }[] = [];
  for (let i = 0; i < pathParts.length; i += 2) {
    ibcChannelTrail.push({
      portId: pathParts[i],
      channelId: pathParts[i + 1],
    });
  }

  const originalChainName = ibcChannelTrail.reduce<string | undefined>(
    (currentChainName, { portId, channelId }) => {
      if (typeof currentChainName === "undefined") {
        return undefined;
      }

      return findCounterpartChainName(currentChainName, portId, channelId);
    },
    chainName
  );

  const originalChainAssets = mapUndefined(assetLookup, originalChainName);

  const originalChainRegistryAsset =
    originalChainAssets &&
    tryDenomToRegistryAsset(baseDenom, originalChainAssets);

  return originalChainRegistryAsset || unknownAsset(path + "/" + baseDenom);
};

const findOriginalAsset = async (
  coin: Coin,
  assets: Asset[],
  ibcAddressToDenomTrace: (address: string) => Promise<DenomTrace | undefined>,
  chainName?: string
): Promise<AddressWithAssetAndAmount> => {
  const { minDenomAmount, denom } = coin;
  let asset;

  if (assets) {
    asset = tryDenomToRegistryAsset(denom, assets);
  }

  if (!asset && chainName) {
    asset = await tryDenomToIbcAsset(denom, ibcAddressToDenomTrace, chainName);
  }

  if (!asset) {
    asset = unknownAsset(denom);
  }

  const baseBalance = BigNumber(minDenomAmount);
  if (baseBalance.isNaN()) {
    throw new Error(`Invalid balance: ${minDenomAmount}`);
  }

  const displayBalance = toDisplayAmount(asset, baseBalance);
  return {
    originalAddress: denom,
    amount: displayBalance,
    asset,
  };
};

export const findChainById = (chainId: string): Chain | undefined => {
  return registry.chains.find((chain) => chain.chain_id === chainId);
};

export const mapCoinsToAssets = async (
  coins: Coin[],
  chainId: string,
  ibcAddressToDenomTrace: (address: string) => Promise<DenomTrace | undefined>
): Promise<AddressWithAssetAndAmountMap> => {
  const chainName = findChainById(chainId)?.chain_name;
  const assets = mapUndefined(assetLookup, chainName);
  const results = await Promise.allSettled(
    coins.map(
      async (coin) =>
        await findOriginalAsset(
          coin,
          assets || [],
          ibcAddressToDenomTrace,
          chainName
        )
    )
  );

  const successfulResults = results.reduce<AddressWithAssetAndAmount[]>(
    (acc, curr) => (curr.status === "fulfilled" ? [...acc, curr.value] : acc),
    []
  );

  return Object.fromEntries(
    successfulResults.map((asset) => [asset.originalAddress, asset])
  );
};

export const getRpcByIndex = (chain: Chain, index = 0): RpcStorage => {
  const availableRpcs = chain.apis?.rpc;
  if (!availableRpcs) {
    throw new Error("There are no available RPCs for " + chain.chain_name);
  }

  const rpc = availableRpcs[Math.min(index, availableRpcs.length - 1)];
  return {
    address: rpc.address,
    index,
  };
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

export const getChainRegistryIbcFilePath = (
  currentNamadaChainId: string,
  ibcChainName: string
): string => {
  const chain =
    searchNamadaTestnetByChainId(currentNamadaChainId) || namadaMainnetChain;
  const searchFilename = `${chain.chain_name}-${ibcChainName}.json`;
  const isMainnet = currentNamadaChainId === namadaMainnetChain.chain_id;
  const ibcFolder = isMainnet ? "_IBC" : "_testnets/_IBC";
  return `${ibcFolder}/${searchFilename}`;
};

export type IbcChannels = {
  namadaChannel: string;
  ibcChannel: string;
};

export const getChannelFromIbcInfo = (
  ibcChainName: string,
  ibcInfo: IBCInfo
): IbcChannels | undefined => {
  const { chain_2, channels } = ibcInfo;
  const channelEntry = channels[0];

  if (!channelEntry) {
    console.warn("No channel entry found in IBC info");
    return;
  }

  const namadaOnChannel1 = chain_2.chain_name === ibcChainName;
  const namadaChannelId = namadaOnChannel1 ? "chain_1" : "chain_2";
  const ibcChannelId = namadaOnChannel1 ? "chain_2" : "chain_1";

  return {
    namadaChannel: channelEntry[namadaChannelId].channel_id,
    ibcChannel: channelEntry[ibcChannelId].channel_id,
  };
};

export const namadaLocal = (chainId: string): Chain => {
  // @ts-expect-error - we're adding localnet to the chain id
  return {
    ...internalDevnetChain,
    chain_name: "localnet",
    chain_id: chainId,
  };
};

export const namadaLocalAsset = (tokenAddress: string): AssetList => ({
  ...internalDevnetAssets,
  chain_name: "localnet",
  assets: internalDevnetAssets.assets.map((asset) =>
    asset.symbol === "NAM" ?
      {
        ...asset,
        address: tokenAddress,
      }
    : asset
  ),
});

export const namadaLocalRelayer = (
  chain1Channel: string,
  chain2Channel: string
): IBCInfo => ({
  ...internalDevnetCosmosTestnetIbc,
  chain_1: {
    ...internalDevnetCosmosTestnetIbc.chain_1,
    chain_name: "localnet",
  },
  chain_2: {
    ...internalDevnetCosmosTestnetIbc.chain_2,
    chain_name: "cosmosicsprovidertestnet",
  },
  channels: [
    {
      ...internalDevnetCosmosTestnetIbc.channels[0],
      chain_1: {
        ...internalDevnetCosmosTestnetIbc.channels[0].chain_1,
        channel_id: chain1Channel,
      },
      chain_2: {
        ...internalDevnetCosmosTestnetIbc.channels[0].chain_2,
        channel_id: chain2Channel,
      },
    },
  ],
});

export const addLocalnetToRegistry = (config: LocalnetToml): void => {
  const { chain_id, token_address, chain_1_channel, chain_2_channel } = config;

  const localChain: ChainRegistryEntry = {
    chain: namadaLocal(chain_id),
    assets: namadaLocalAsset(token_address),
    ibc: [namadaLocalRelayer(chain_1_channel, chain_2_channel)],
  };

  registry.chains.push(localChain.chain);
  registry.assets.push(localChain.assets);
  registry.ibc.push(...localChain.ibc!);

  mainnetChains.push(localChain);
};

export const getDenomFromIbcTrace = (ibcAddress: string): string => {
  return ibcAddress.replaceAll(/(transfer\/|channel-\d+\/)*/gi, "");
};

export const chainHasFeeTokenDenom = (chain: Chain, denom: string): boolean => {
  return !!chain.fees?.fee_tokens?.some(
    (feeToken) => feeToken.denom.toLowerCase() === denom.toLowerCase()
  );
};

export const searchChainByDenom = (denom: string): Chain | undefined => {
  return getKnownChains(false).find(
    (chainRegistry: ChainRegistryEntry | undefined) => {
      if (!chainRegistry) return false;
      return chainHasFeeTokenDenom(chainRegistry.chain, denom);
    }
  )?.chain;
};
