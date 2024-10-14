import { AssetList, Chain } from "@chain-registry/types";
import { ExtensionKey } from "@namada/types";
import { queryDependentFn } from "atoms/utils";
import { atomWithMutation, atomWithQuery } from "jotai-tanstack-query";
import { atomFamily, atomWithStorage } from "jotai/utils";
import { mapCoinsToAssets } from "./functions";
import {
  IBCTransferParams,
  queryAndStoreRpc,
  queryAssetBalances,
  submitIbcTransfer,
} from "./services";

type IBCTransferAtomParams = {
  transferParams: IBCTransferParams;
  chain: Chain;
};

type AssetBalanceAtomParams = {
  chain?: Chain;
  assets?: AssetList;
  sourceAddress?: string;
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
  ({ chain, sourceAddress, assets }: AssetBalanceAtomParams) => {
    return atomWithQuery(() => ({
      queryKey: ["assets", sourceAddress, chain?.chain_id, assets],
      ...queryDependentFn(async () => {
        const assetsBalances = await queryAndStoreRpc(
          chain!,
          async (rpc: string) => {
            return await queryAssetBalances(sourceAddress!, rpc);
          }
        );
        return mapCoinsToAssets(assetsBalances, assets!);
      }, [!!sourceAddress, !!chain]),
    }));
  },
  (prev, current) =>
    Boolean(
      prev.chain &&
        current.chain &&
        prev.chain.chain_id === current.chain?.chain_id &&
        prev.sourceAddress === current.sourceAddress
    )
);
