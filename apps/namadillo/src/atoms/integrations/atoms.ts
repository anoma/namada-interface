import { AssetList, Chain } from "@chain-registry/types";
import { ExtensionKey } from "@namada/types";
import { settingsAtom } from "atoms/settings";
import { queryDependentFn } from "atoms/utils";
import { atom } from "jotai";
import { atomWithMutation, atomWithQuery } from "jotai-tanstack-query";
import { atomFamily, atomWithStorage } from "jotai/utils";
import { ChainRegistryEntry } from "types";
import { getKnownChains, mapCoinsToAssets } from "./functions";
import {
  IbcTransferParams,
  queryAndStoreRpc,
  queryAssetBalances,
  submitIbcTransfer,
} from "./services";

type IBCTransferAtomParams = {
  transferParams: IbcTransferParams;
  chain: Chain;
};

type AssetBalanceAtomParams = {
  chain?: Chain;
  assets?: AssetList;
  walletAddress?: string;
};

// Currently we're just integrating with Keplr, but in the future we might use different wallets
export const selectedIBCWallet = atomWithStorage<ExtensionKey | undefined>(
  "namadillo:ibc:wallet",
  undefined
);

export const selectedIBCChainAtom = atomWithStorage<string | undefined>(
  "namadillo:ibc:chainId",
  undefined
);

export const workingRpcsAtom = atomWithStorage<Record<string, string>>(
  "namadillo:rpcs",
  {}
);

export const ibcTransferAtom = atomWithMutation(() => {
  return {
    mutationKey: ["ibc-transfer"],
    mutationFn: async ({
      transferParams,
      chain,
    }: IBCTransferAtomParams): Promise<void> => {
      await queryAndStoreRpc(chain, submitIbcTransfer(transferParams));
    },
  };
});

export const assetBalanceAtomFamily = atomFamily(
  ({ chain, walletAddress, assets }: AssetBalanceAtomParams) => {
    return atomWithQuery(() => ({
      queryKey: ["assets", walletAddress, chain?.chain_id, assets],
      ...queryDependentFn(async () => {
        const assetsBalances = await queryAndStoreRpc(
          chain!,
          async (rpc: string) => {
            return await queryAssetBalances(walletAddress!, rpc);
          }
        );
        return mapCoinsToAssets(assetsBalances, assets!);
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

export const knownChainsAtom = atom((get) => {
  const settings = get(settingsAtom);
  const knownChains = getKnownChains(settings.enableTestnets);
  const map: Record<string, ChainRegistryEntry> = {};
  knownChains.forEach((chain) => {
    map[chain.chain.chain_id] = chain;
  });
  return map;
});
