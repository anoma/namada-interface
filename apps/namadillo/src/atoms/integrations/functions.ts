import { AssetList, Chain, IBCInfo } from "@chain-registry/types";
import * as celestia from "chain-registry/mainnet/celestia";
import * as cosmoshub from "chain-registry/mainnet/cosmoshub";
import * as namada from "chain-registry/mainnet/namada";
import * as neutron from "chain-registry/mainnet/neutron";
import * as noble from "chain-registry/mainnet/noble";
import * as nyx from "chain-registry/mainnet/nyx";
import * as osmosis from "chain-registry/mainnet/osmosis";
import * as stride from "chain-registry/mainnet/stride";
import invariant from "invariant";
import {
  Address,
  Asset,
  ChainRegistryEntry,
  IbcChannels,
  NamadaAsset,
  NamadaChainRegistryEntry,
  RpcStorage,
} from "types";

// TODO: get those from  "chain-registry" package once it's there
import housefireIbcCelestia from "@namada/chain-registry/_testnets/_IBC/namadahousefire-celestia.json";
import housefireIbcCosmoshub from "@namada/chain-registry/_testnets/_IBC/namadahousefire-cosmoshub.json";
import housefireIbcOsmosis from "@namada/chain-registry/_testnets/_IBC/namadahousefire-osmosis.json";
import housefireIbcStride from "@namada/chain-registry/_testnets/_IBC/namadahousefire-stride.json";
import housefireAssets from "@namada/chain-registry/_testnets/namadahousefire/assetlist.json";
import housefireChain from "@namada/chain-registry/_testnets/namadahousefire/chain.json";

const housefire: ChainRegistryEntry = {
  chain: housefireChain as Chain,
  assets: housefireAssets as AssetList,
  ibc: [
    housefireIbcCelestia,
    housefireIbcCosmoshub,
    housefireIbcStride,
    housefireIbcOsmosis,
  ] as IBCInfo[],
};

// Whitelist of supported chains
const SUPPORTED_CHAINS_MAP = new Map<string, ChainRegistryEntry>(
  Object.entries({
    osmosis: osmosis,
    cosmoshub: cosmoshub,
    celestia: celestia,
    nyx: nyx,
    stride: stride,
    neutron: neutron,
    noble: noble,
  })
);

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

export const getDenomFromIbcTrace = (ibcAddress: string): string => {
  return ibcAddress.replaceAll(/(transfer\/|channel-\d+\/)*/gi, "");
};

export const getChannelFromIbcInfo = (
  ibcChainName: string,
  ibcInfo: IBCInfo
): IbcChannels => {
  const { chain_2, channels } = ibcInfo;
  const channelEntry = channels[0];

  invariant(channelEntry, "No channel entry found in IBC info");

  const namadaOnChannel1 = chain_2.chain_name === ibcChainName;
  const namadaChannelId = namadaOnChannel1 ? "chain_1" : "chain_2";
  const ibcChannelId = namadaOnChannel1 ? "chain_2" : "chain_1";

  return {
    namadaChannel: channelEntry[namadaChannelId].channel_id,
    ibcChannel: channelEntry[ibcChannelId].channel_id,
  };
};

export const getChainRegistryByChainId = (
  chainId: string
): ChainRegistryEntry | undefined => {
  return SUPPORTED_CHAINS_MAP.values().find(
    (registry) => registry.chain.chain_id === chainId
  );
};

export const getChainRegistryByChainName = (
  chainName: string
): ChainRegistryEntry | undefined => {
  return SUPPORTED_CHAINS_MAP.get(chainName);
};

export const getAvailableChains = (): Chain[] => {
  return SUPPORTED_CHAINS_MAP.values()
    .map((entry) => entry.chain)
    .toArray();
};

export const getNamadaChainRegistry = (
  isHousefire: boolean
): NamadaChainRegistryEntry => {
  return (isHousefire ? housefire : namada) as NamadaChainRegistryEntry;
};

export const getNamadaChainAssetsMap = (
  isHousefire: boolean
): Record<Address, NamadaAsset> =>
  getNamadaChainRegistry(isHousefire).assets.assets.reduce((acc, curr) => {
    return curr.address ? { ...acc, [curr.address]: curr } : acc;
  }, {});

export const getNamadaAssetByIbcAsset = (
  asset: Asset,
  namadaAssets: NamadaAsset[]
): NamadaAsset | undefined => {
  // Returns base denom for provided asset(e.g. "uosmo", "uatom", "unam")
  const counterpartyBaseDenom =
    asset.traces?.[0].counterparty.base_denom || asset.base;

  const namadaAsset = namadaAssets.find((namadaAsset) => {
    return (
      // Match native token(unam)
      counterpartyBaseDenom === namadaAsset.base ||
      // Match any other token
      counterpartyBaseDenom === namadaAsset.traces?.[0].counterparty.base_denom
    );
  });

  return namadaAsset;
};

export const getNamadaIbcInfo = (isHousefire: boolean): IBCInfo[] => {
  const ibcInfo = getNamadaChainRegistry(isHousefire).ibc;
  invariant(ibcInfo, "Namada IBC info is not available");

  return ibcInfo;
};
