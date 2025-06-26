import { AssetList, Chain } from "@chain-registry/types";
import { DeliverTxResponse, SigningStargateClient } from "@cosmjs/stargate";
import { ExtensionKey } from "@namada/types";
import { chainAtom, chainTokensAtom } from "atoms/chain";
import { defaultServerConfigAtom } from "atoms/settings";
import { queryDependentFn } from "atoms/utils";
import BigNumber from "bignumber.js";
import { TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx";
import invariant from "invariant";
import { atomWithMutation, atomWithQuery } from "jotai-tanstack-query";
import { atomFamily, atomWithStorage } from "jotai/utils";
import { AssetWithAmount, BaseDenom, IbcChannels, RpcStorage } from "types";
import { toDisplayAmount } from "utils";
import { getChainRegistryByChainName } from "./functions";
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

/// Balance of KEPLR assets, should be only used in the context of deposits to Namada
export const assetBalanceAtomFamily = atomFamily(
  ({ chain, walletAddress, assets }: AssetBalanceAtomParams) => {
    return atomWithQuery<Record<BaseDenom, AssetWithAmount>>(() => ({
      queryKey: ["assets", walletAddress, chain?.chain_id, assets],
      ...queryDependentFn(async () => {
        return await queryAndStoreRpc(chain!, async (rpc: string) => {
          const assetsBalances = await queryAssetBalances(walletAddress!, rpc);
          const assetList = getChainRegistryByChainName(
            chain!.chain_name
          )?.assets;
          invariant(assetList, "Asset list not found for chain");

          return assetsBalances.reduce(
            (acc, curr) => {
              const asset = assetList.assets.find((a) => a.base === curr.denom);
              return asset ?
                  {
                    ...acc,
                    [asset.base]: {
                      asset,
                      amount: toDisplayAmount(
                        asset,
                        BigNumber(curr.minDenomAmount)
                      ),
                    },
                  }
                : acc;
            },
            {} as Record<BaseDenom, AssetWithAmount>
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

export const ibcRateLimitAtom = atomWithQuery((get) => {
  const chainTokens = get(chainTokensAtom);
  return {
    queryKey: ["ibc-rate-limit", chainTokens],
    ...queryDependentFn(async () => {
      return await fetchIbcRateLimits();
    }, [chainTokens]),
  };
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
