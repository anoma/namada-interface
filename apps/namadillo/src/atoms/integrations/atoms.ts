import { AssetList, Chain } from "@chain-registry/types";
import { DeliverTxResponse, SigningStargateClient } from "@cosmjs/stargate";
import { ExtensionKey } from "@namada/types";
import { defaultAccountAtom } from "atoms/accounts";
import { chainAtom, chainTokensAtom } from "atoms/chain";
import { defaultServerConfigAtom, settingsAtom } from "atoms/settings";
import { queryDependentFn } from "atoms/utils";
import BigNumber from "bignumber.js";
import { TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx";
import invariant from "invariant";
import { atom } from "jotai";
import { atomWithMutation, atomWithQuery } from "jotai-tanstack-query";
import { atomFamily, atomWithStorage } from "jotai/utils";
import {
  AddressWithAssetAndAmountMap,
  ChainId,
  ChainRegistryEntry,
  RpcStorage,
} from "types";
import { githubNamadaChainRegistryBaseUrl } from "urls";
import {
  addLocalnetToRegistry,
  getDenomFromIbcTrace,
  getKnownChains,
  ibcAddressToDenomTrace,
  IbcChannels,
  mapCoinsToAssets,
} from "./functions";
import {
  broadcastIbcTransaction,
  fetchIbcChannelFromRegistry,
  fetchIbcRateLimits,
  fetchLocalnetTomlConfig,
  queryAndStoreRpc,
  queryAssetBalances,
} from "./services";

export const mainnetNamDenomOnOsmosis =
  "ibc/C7110DEC66869DAE9BE9C3C60F4B5313B16A2204AE020C3B0527DD6B322386A3";

export const housefireNamDenomOnOsmosis =
  "ibc/48473B990DD70EC30F270727C4FEBA5D49C7D74949498CDE99113B13F9EA5522";

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

export const assetBalanceAtomFamily = atomFamily(
  ({ chain, walletAddress, assets }: AssetBalanceAtomParams) => {
    return atomWithQuery<AddressWithAssetAndAmountMap>(() => ({
      queryKey: ["assets", walletAddress, chain?.chain_id, assets],
      ...queryDependentFn(async () => {
        return await queryAndStoreRpc(chain!, async (rpc: string) => {
          const assetsBalances = await queryAssetBalances(walletAddress!, rpc);

          // Housefire NAM is still appearing because the function `ibcAddressToDenomTrace`
          // calls stargate to get the denom based on the `ibc/...` address, and this is
          // returning the NAM, so we can't filter it without a major assets refactoring.
          // For now, let's filter it individually while we don't have a good solution
          // Some solutions:
          // - Check only the registry and ignore dynamic values from stargate
          // - Create an allow/blocklist to filter it with more control
          const allowedBalances = assetsBalances.filter(
            (i) => i.denom !== housefireNamDenomOnOsmosis
          );

          return await mapCoinsToAssets(
            allowedBalances,
            chain!.chain_id,
            ibcAddressToDenomTrace(rpc)
          );
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
  (get) => {
    const settings = get(settingsAtom);
    const knownChains = getKnownChains(settings.advancedMode);
    const map: Record<ChainId, ChainRegistryEntry> = {};
    knownChains.forEach((chain) => {
      map[chain.chain.chain_id] = chain;
    });
    return map;
  }
);

// Lists only the available chain list
export const availableChainsAtom = atom((get) => {
  const settings = get(settingsAtom);
  return getKnownChains(settings.advancedMode).map(({ chain }) => chain);
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
        return fetchIbcChannelFromRegistry(
          chainSettings.data.chainId,
          ibcChainName,
          githubNamadaChainRegistryBaseUrl
        );
      }, [chainSettings, config, !!ibcChainName]),
    };
  })
);

export const localnetConfigAtom = atomWithQuery((get) => {
  const config = get(defaultServerConfigAtom);

  return {
    queryKey: ["localnet-config", config],
    staleTime: Infinity,
    retry: false,

    ...queryDependentFn(async () => {
      try {
        const localnetConfig = await fetchLocalnetTomlConfig();
        addLocalnetToRegistry(localnetConfig);

        return {
          chainId: localnetConfig.chain_id,
          tokenAddress: localnetConfig.token_address,
        };
      } catch (_) {
        // If file not found just ignore
        return null;
      }
    }, [Boolean(config.data?.localnet_enabled)]),
  };
});
