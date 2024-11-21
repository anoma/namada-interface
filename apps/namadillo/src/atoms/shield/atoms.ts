import { defaultAccountAtom } from "atoms/accounts";
import { chainAtom } from "atoms/chain";
import { indexerUrlAtom, rpcUrlAtom } from "atoms/settings";
import { atomWithMutation } from "jotai-tanstack-query";
import {
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
      return submitUnshieldTx(rpcUrl, account!, chain!, indexerUrl, params);
    },
  };
});
