import { Chain, IBCInfo } from "@chain-registry/types";
import { Asset, IbcTransition } from "@chain-registry/types/assetlist.schema";
import * as celestia from "chain-registry/mainnet/celestia";
import * as cosmoshub from "chain-registry/mainnet/cosmoshub";
import * as namada from "chain-registry/mainnet/namada";
import * as neutron from "chain-registry/mainnet/neutron";
import * as noble from "chain-registry/mainnet/noble";
import * as nyx from "chain-registry/mainnet/nyx";
import * as osmosis from "chain-registry/mainnet/osmosis";
import * as stride from "chain-registry/mainnet/stride";
import invariant from "invariant";
import { Address, ChainRegistryEntry, RpcStorage } from "types";

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

// TODO: move
export type IbcChannels = {
  namadaChannel: string;
  ibcChannel: string;
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

// Utility functions for chain registry
// TODO: move to global utility file

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

// Utility function to get the chain name by Namada asset base_denom
// Used by Ibc Withdraw to determine the target chain for the withdrawal
// TODO: not sure why we pass denom here instead of namada address?
export const getChainNameByNamadaAssetDenom = (
  denom: string
): string | undefined => {
  let chainName;
  for (const asset of namada.assets.assets) {
    const trace = asset.traces?.find(
      (trace) => trace.type === "ibc" && trace.counterparty.base_denom === denom
    ) as IbcTransition | undefined;
    if (trace) {
      chainName = trace.counterparty.chain_name;
      break;
    }
  }

  return chainName;
};

export const getNamadaChainRegistry = (): ChainRegistryEntry => {
  return namada;
};

export const getNamadaChainAssetsMap = (): Record<Address, Asset> =>
  getNamadaChainRegistry().assets.assets.reduce((acc, curr) => {
    return curr.address ? { ...acc, [curr.address]: curr } : acc;
  }, {});
