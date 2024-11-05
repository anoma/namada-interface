import { Asset, Chain } from "@chain-registry/types";
import { Coin } from "@cosmjs/launchpad";
import { QueryClient, setupIbcExtension } from "@cosmjs/stargate";
import { Tendermint34Client } from "@cosmjs/tendermint-rpc";
import { mapUndefined } from "@namada/utils";
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
import { DenomTrace } from "cosmjs-types/ibc/applications/transfer/v1/transfer";
import {
  AssetWithBalanceAndIbcInfo,
  AssetWithBalanceAndIbcInfoMap,
  ChainRegistryEntry,
} from "types";
import { toDisplayAmount } from "utils";

// TODO: this causes a big increase on bundle size. See #1224.
import cosmosRegistry from "chain-registry";

// TODO: remove once integrated with namada-chain-registry
cosmosRegistry.ibc.push({
  chain_1: {
    chain_name: "cosmoshubtestnet",
    client_id: "07-tendermint-3792",
    connection_id: "connection-3832",
  },
  chain_2: {
    chain_name: "internal-devnet-44a.1bd3e6ca62",
    client_id: "07-tendermint-0",
    connection_id: "connection-0",
  },
  channels: [
    {
      chain_1: {
        channel_id: "channel-4353",
        port_id: "transfer",
      },
      chain_2: {
        channel_id: "channel-0",
        port_id: "transfer",
      },
      ordering: "unordered",
      version: "ics20-1",
    },
  ],
});

// TODO: remove once integrated with namada-chain-registry
cosmosRegistry.assets.push({
  chain_name: "internal-devnet-44a.1bd3e6ca62",
  assets: [
    {
      name: "Namada",
      base: "unam",
      display: "nam",
      symbol: "NAM",
      denom_units: [
        {
          denom: "unam",
          exponent: 0,
        },
        {
          denom: "nam",
          exponent: 6,
        },
      ],
    },
  ],
});

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

const ibcAddressToDenomTrace = async (
  rpc: string,
  address: string
): Promise<DenomTrace> => {
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
  cosmosRegistry.assets.find((chain) => chain.chain_name === chainName)?.assets;

type AssetAndIbc = Pick<AssetWithBalanceAndIbcInfo, "asset" | "ibc">;

const tryCoinToRegistryAsset = (
  coin: Coin,
  registryAssets: Asset[]
): AssetAndIbc | undefined => {
  const registryAsset = registryAssets.find(
    (asset) => asset.base === coin.denom
  );

  if (typeof registryAsset !== "undefined") {
    return {
      asset: registryAsset,
    };
  } else {
    return undefined;
  }
};

const tryCoinToIbcAsset = async (
  coin: Coin,
  rpc: string,
  chainName: string
): Promise<AssetAndIbc | undefined> => {
  const { denom } = coin;

  if (!denom.startsWith("ibc/")) {
    return undefined;
  }

  const { path, baseDenom } = await ibcAddressToDenomTrace(rpc, denom);

  const ibcProps = {
    ibcAddress: denom,
    denomTracePath: path,
  };

  // TODO: check this is valid for tokens that have been transferred between
  // more than one chain
  const [portId, channelId] = path.split("/");

  const sourceChainName = cosmosRegistry.ibc.reduce<string | undefined>(
    (acc, curr) => {
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
    },
    undefined
  );

  const sourceAssets = mapUndefined(assetLookup, sourceChainName);

  // TODO: Special handling for Namada because NAM assets are named "tnam...",
  // and we need to decode this address. For now assuming that if the source
  // chain is the internal devnet, then the asset is NAM. This is not correct
  // and should be fixed.
  if (sourceChainName === "internal-devnet-44a.1bd3e6ca62") {
    const namAsset = sourceAssets?.[0];
    if (typeof namAsset === "undefined") {
      throw new Error(
        "No NAM asset for internal devnet. This should never happen."
      );
    }

    return {
      asset: namAsset,
      ...ibcProps,
    };
  }

  const sourceRegistryAsset = sourceAssets?.find(
    (asset) => asset.base === baseDenom
  );

  const assetProp =
    typeof sourceRegistryAsset !== "undefined" ?
      { asset: sourceRegistryAsset }
    : unknownAsset(path + "/" + baseDenom);

  return {
    ...assetProp,
    ...ibcProps,
  };
};

const unknownAsset = (denom: string): AssetAndIbc => ({
  asset: {
    denom_units: [
      {
        denom,
        exponent: 0,
      },
    ],
    base: denom,
    name: denom,
    display: denom,
    symbol: denom,
  },
});

export const mapCoinsToAssets = async (
  coins: Coin[],
  chainName: string,
  rpc: string
): Promise<AssetWithBalanceAndIbcInfoMap> => {
  const chain = cosmosRegistry.chains.find(
    (chain) => chain.chain_name === chainName
  );

  if (typeof chain === "undefined") {
    throw new Error(`No chain info found for ${chainName} in chain registry`);
  }

  const assets = assetLookup(chainName);
  if (typeof assets === "undefined") {
    throw new Error(`No asset info found for ${chainName} in chain registry`);
  }

  const results = await Promise.all(
    coins.map(async (coin: Coin): Promise<AssetWithBalanceAndIbcInfo> => {
      const assetAndIbc =
        tryCoinToRegistryAsset(coin, assets) ||
        (await tryCoinToIbcAsset(coin, rpc, chainName)) ||
        unknownAsset(coin.denom);

      const { amount } = coin;
      const baseBalance = BigNumber(amount);
      if (baseBalance.isNaN()) {
        throw new Error(`Balance is invalid, got ${amount}`);
      }
      // We always represent amounts in their display denom, so convert here
      const displayBalance = toDisplayAmount(assetAndIbc.asset, baseBalance);

      return {
        balance: displayBalance,
        ...assetAndIbc,
      };
    })
  );

  // TODO: keying by asset base isn't going to work when there are multiple
  // assets with the same base from different chains. Fix this.
  return Object.fromEntries(results.map((asset) => [asset.asset.base, asset]));
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
