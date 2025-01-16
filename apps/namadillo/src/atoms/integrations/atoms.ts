import { AssetList, Chain } from "@chain-registry/types";
import { DeliverTxResponse, SigningStargateClient } from "@cosmjs/stargate";
import {
  ExtensionKey,
  IbcTransferMsgValue,
  IbcTransferProps,
} from "@namada/types";
import { defaultAccountAtom } from "atoms/accounts";
import { chainAtom } from "atoms/chain";
import { defaultServerConfigAtom, settingsAtom } from "atoms/settings";
import { queryDependentFn } from "atoms/utils";
import { TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx";
import invariant from "invariant";
import { atom } from "jotai";
import { atomWithMutation, atomWithQuery } from "jotai-tanstack-query";
import { atomFamily, atomWithStorage } from "jotai/utils";
import { TransactionPair } from "lib/query";
import {
  AddressWithAssetAndAmountMap,
  BuildTxAtomParams,
  ChainId,
  ChainRegistryEntry,
  RpcStorage,
} from "types";
import { githubNamadaChainRegistryBaseUrl } from "urls";
import {
  addLocalnetToRegistry,
  createIbcTx,
  getKnownChains,
  ibcAddressToDenomTrace,
  IbcChannels,
  mapCoinsToAssets,
} from "./functions";
import {
  broadcastIbcTransaction,
  fetchIbcChannelFromRegistry,
  fetchLocalnetTomlConfig,
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

export const assetBalanceAtomFamily = atomFamily(
  ({ chain, walletAddress, assets }: AssetBalanceAtomParams) => {
    return atomWithQuery<AddressWithAssetAndAmountMap>(() => ({
      queryKey: ["assets", walletAddress, chain?.chain_id, assets],
      ...queryDependentFn(async () => {
        return await queryAndStoreRpc(chain!, async (rpc: string) => {
          const assetsBalances = await queryAssetBalances(walletAddress!, rpc);
          return await mapCoinsToAssets(
            assetsBalances,
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
    const knownChains = getKnownChains(settings.enableTestnets);
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
  return getKnownChains(settings.enableTestnets).map(({ chain }) => chain);
});

// Lists only the available assets list
export const availableAssetsAtom = atom((get) => {
  const settings = get(settingsAtom);
  return getKnownChains(settings.enableTestnets).map(({ assets }) => assets);
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

export const createIbcTxAtom = atomWithMutation((get) => {
  const account = get(defaultAccountAtom);
  const chain = get(chainAtom);
  return {
    enabled: account.isSuccess && chain.isSuccess,
    mutationKey: ["create-ibc-tx"],
    mutationFn: async ({
      params,
      memo,
      account,
      gasConfig,
    }: BuildTxAtomParams<IbcTransferMsgValue>): Promise<
      TransactionPair<IbcTransferProps> | undefined
    > => {
      if (typeof account === "undefined") {
        throw new Error("no account");
      }

      if (params.length === 0) {
        throw new Error("Invalid params");
      }

      const {
        receiver: destinationAddress,
        token,
        amountInBaseDenom,
        portId,
        channelId,
      } = params[0];

      return await createIbcTx(
        account,
        destinationAddress,
        token,
        amountInBaseDenom,
        portId,
        channelId,
        gasConfig,
        chain.data!,
        memo
      );
    },
  };
});

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
