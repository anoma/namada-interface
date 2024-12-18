import { defaultAccountAtom } from "atoms/accounts";
import { viewingKeysAtom } from "atoms/balance";
import { chainAtom } from "atoms/chain";
import { indexerUrlAtom, rpcUrlAtom } from "atoms/settings";
import { queryDependentFn } from "atoms/utils";
import BigNumber from "bignumber.js";
import { NamadaKeychain } from "hooks/useNamadaKeychain";
import { atomWithMutation, atomWithQuery } from "jotai-tanstack-query";
import { namadaAsset, toDisplayAmount } from "utils";
import {
  fetchShieldRewards,
  ShieldTransferParams,
  submitShieldTx,
  submitUnshieldTx,
  UnshieldTransferParams,
} from "./services";

export const shieldTxAtom = atomWithMutation((get) => {
  const rpcUrl = get(rpcUrlAtom);
  const { data: account } = get(defaultAccountAtom);
  const { data: chain } = get(chainAtom);
  const indexerUrl = get(indexerUrlAtom);

  return {
    mutationKey: ["shield-tx"],
    mutationFn: async (params: ShieldTransferParams) => {
      return await submitShieldTx(rpcUrl, account!, chain!, indexerUrl, params);
    },
  };
});

export const unshieldTxAtom = atomWithMutation((get) => {
  const rpcUrl = get(rpcUrlAtom);
  const { data: account } = get(defaultAccountAtom);
  const { data: chain } = get(chainAtom);
  const indexerUrl = get(indexerUrlAtom);

  return {
    mutationKey: ["unshield-tx"],
    mutationFn: async (params: UnshieldTransferParams) => {
      const namada = await new NamadaKeychain().get();
      const disposableSigner = await namada?.genDisposableKeypair();
      if (!disposableSigner) {
        throw new Error("No signer available");
      }

      return submitUnshieldTx(
        rpcUrl,
        account!,
        chain!,
        indexerUrl,
        params,
        disposableSigner
      );
    },
  };
});

export const shieldRewardsAtom = atomWithQuery((get) => {
  const viewingKeysQuery = get(viewingKeysAtom);

  return {
    queryKey: ["shield-rewards", viewingKeysQuery.data],
    ...queryDependentFn(async () => {
      const [vk] = viewingKeysQuery.data!;
      const minDenomAmount = await fetchShieldRewards(vk);

      return {
        amount: toDisplayAmount(namadaAsset(), BigNumber(minDenomAmount)),
      };
    }, [viewingKeysQuery]),
  };
});
