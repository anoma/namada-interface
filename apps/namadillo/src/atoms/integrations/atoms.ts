import { Asset, AssetList, Chain } from "@chain-registry/types";
import { DeliverTxResponse, SigningStargateClient } from "@cosmjs/stargate";
import { ExtensionKey } from "@namada/types";
import { defaultAccountAtom } from "atoms/accounts";
import { chainAtom, chainTokensAtom } from "atoms/chain";
import { defaultServerConfigAtom } from "atoms/settings";
import { queryDependentFn } from "atoms/utils";
import BigNumber from "bignumber.js";
import chainRegistry from "chain-registry";
import { TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx";
import invariant from "invariant";
import { atom } from "jotai";
import { atomWithMutation, atomWithQuery } from "jotai-tanstack-query";
import { atomFamily, atomWithStorage } from "jotai/utils";
import { ChainId, ChainRegistryEntry, RpcStorage } from "types";
import {
  getDenomFromIbcTrace,
  IbcChannels,
  SUPPORTED_CHAINS_MAP,
} from "./functions";
import {
  broadcastIbcTransaction,
  fetchIbcChannelFromRegistry,
  fetchIbcRateLimits,
  queryAndStoreRpc,
  queryAssetBalances,
} from "./services";

type IBCTransferAtomParams = {
  client: SigningStargateClient;
  tx: TxRaw;
};

type AssetBalanceAtomParams = {
  chain?: Chain;
  assets?: AssetList;
  walletAddress?: string;
};

export const connectedWalletsAtom = atomWithStorage<
  Partial<Record<ExtensionKey, boolean>>
>("namadillo:connectedWallets", {});

// Currently we're just integrating with Keplr, but in the future we might use different wallets
export const selectedWalletAtom = atomWithStorage<ExtensionKey | undefined>(
  "namadillo:wallet",
  undefined
);

export const selectedIBCChainAtom = atomWithStorage<string | undefined>(
  "namadillo:ibc:chainId",
  undefined
);

export const rpcByChainAtom = atomWithStorage<
  Record<string, RpcStorage> | undefined
>("namadillo:rpc:active", undefined);

export const broadcastIbcTransactionAtom = atomWithMutation(() => {
  return {
    mutationKey: ["ibc-transfer"],
    mutationFn: async ({
      client,
      tx,
    }: IBCTransferAtomParams): Promise<DeliverTxResponse> => {
      return await broadcastIbcTransaction(client, tx);
    },
  };
});

/// Balance of KEPLR assets(non NAMADA assets), should be only used in the context of deposits to Namada
export const assetBalanceAtomFamily = atomFamily(
  ({ chain, walletAddress, assets }: AssetBalanceAtomParams) => {
    // TODO: move type
    return atomWithQuery<{ asset: Asset; minDenomAmount: BigNumber }[]>(() => ({
      queryKey: ["assets", walletAddress, chain?.chain_id, assets],
      ...queryDependentFn(async () => {
        return await queryAndStoreRpc(chain!, async (rpc: string) => {
          const assetsBalances = await queryAssetBalances(walletAddress!, rpc);
          const assetList = chainRegistry.assets.find(
            (al) => al.chain_name === chain!.chain_name
          );
          invariant(assetList, "Asset list not found for chain");

          const assetBalance = assetsBalances.flatMap((ab) => {
            const asset = assetList.assets.find((a) => a.base === ab.denom);

            // Filter out assets that are not in the asset list
            return asset ?
                [{ asset, minDenomAmount: BigNumber(ab.minDenomAmount) }]
              : [];
          });

          return assetBalance;
        });
      }, [!!walletAddress, !!chain]),
    }));
  },
  (prev, current) => {
    return Boolean(
      !current.chain ||
        !current.walletAddress ||
        (prev.chain?.chain_id === current.chain?.chain_id &&
          prev.walletAddress === current.walletAddress)
    );
  }
);

// Every entry contains information about the chain, available assets and IBC channels
export const chainRegistryAtom = atom<Record<ChainId, ChainRegistryEntry>>(
  () => {
    // TODO: maybe not needed
    return SUPPORTED_CHAINS_MAP.values().reduce(
      (acc, curr) => {
        return { ...acc, [curr.chain.chain_id]: curr };
      },
      {} as Record<ChainId, ChainRegistryEntry>
    );
  }
);

// Lists only the available chain list
export const availableChainsAtom = atom(() => {
  return SUPPORTED_CHAINS_MAP.values()
    .map((val) => val.chain)
    .toArray();
});

export const ibcRateLimitAtom = atomWithQuery((get) => {
  const chainTokens = get(chainTokensAtom);
  return {
    queryKey: ["ibc-rate-limit", chainTokens],
    ...queryDependentFn(async () => {
      return await fetchIbcRateLimits();
    }, [chainTokens]),
  };
});

export const enabledIbcAssetsDenomFamily = atomFamily((ibcChannel?: string) => {
  return atomWithQuery((get) => {
    const chainTokens = get(chainTokensAtom);
    const ibcRateLimits = get(ibcRateLimitAtom);
    const defaultAccount = get(defaultAccountAtom);

    return {
      queryKey: ["availableAssets", defaultAccount, ibcChannel],
      ...queryDependentFn(async () => {
        const channelAvailableTokens = chainTokens.data!.filter((token) => {
          if ("trace" in token) {
            return token.trace.indexOf(ibcChannel + "/") >= 0;
          }
          return false;
        });

        const availableTokens: string[] = ["nam", "unam"];
        channelAvailableTokens.forEach((token) => {
          const ibcRateLimit = ibcRateLimits.data?.find(
            (rateLimit) => rateLimit.tokenAddress === token.address
          );
          if (
            // if we don't have a rate limit defined on the indexer, believe that the sky is the limit
            !ibcRateLimit ||
            // otherwise, check if the limit is greater than zero
            (ibcRateLimit && BigNumber(ibcRateLimit.throughputLimit).gt(0))
          ) {
            if ("trace" in token) {
              availableTokens.push(getDenomFromIbcTrace(token.trace));
            }
          }
        });

        return availableTokens;
      }, [chainTokens, ibcRateLimits, defaultAccount, !!ibcChannel]),
    };
  });
});

export const ibcChannelsFamily = atomFamily((ibcChainName?: string) =>
  atomWithQuery<IbcChannels | null>((get) => {
    const chainSettings = get(chainAtom);
    const config = get(defaultServerConfigAtom);
    return {
      queryKey: ["known-channels", ibcChainName, chainSettings.data?.chainId],
      retry: false,
      ...queryDependentFn(async () => {
        invariant(chainSettings.data, "No chain settings");
        invariant(ibcChainName, "No IBC chain name");
        return fetchIbcChannelFromRegistry(ibcChainName);
      }, [chainSettings, config, !!ibcChainName]),
    };
  })
);
