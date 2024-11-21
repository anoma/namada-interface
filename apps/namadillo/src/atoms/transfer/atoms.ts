import {
  ShieldedTransferMsgValue,
  ShieldingTransferMsgValue,
  TransparentTransferMsgValue,
  UnshieldingTransferMsgValue,
} from "@namada/types";
import { chainAtom } from "atoms/chain";
import { atomWithMutation } from "jotai-tanstack-query";
import { BuildTxAtomParams } from "types";
import {
  createShieldedTransferTx,
  createShieldingTransferTx,
  createTransparentTransferTx,
  createUnshieldingTransferTx,
} from "./services";

export const createTransparentTransferAtom = atomWithMutation((get) => {
  const chain = get(chainAtom);
  return {
    mutationKey: ["create-transparent-transfer-tx"],
    enabled: chain.isSuccess,
    mutationFn: async ({
      params,
      gasConfig,
      account,
    }: BuildTxAtomParams<TransparentTransferMsgValue>) =>
      createTransparentTransferTx(chain.data!, account, params, gasConfig),
  };
});

export const createShieldedTransferAtom = atomWithMutation((get) => {
  const chain = get(chainAtom);
  return {
    mutationKey: ["create-shielded-transfer-tx"],
    enabled: chain.isSuccess,
    mutationFn: async ({
      params,
      gasConfig,
      account,
    }: BuildTxAtomParams<ShieldedTransferMsgValue>) =>
      createShieldedTransferTx(chain.data!, account, params, gasConfig),
  };
});

export const createShieldingTransferAtom = atomWithMutation((get) => {
  const chain = get(chainAtom);
  return {
    mutationKey: ["create-shielding-transfer-tx"],
    enabled: chain.isSuccess,
    mutationFn: async ({
      params,
      gasConfig,
      account,
    }: BuildTxAtomParams<ShieldingTransferMsgValue>) =>
      createShieldingTransferTx(chain.data!, account, params, gasConfig),
  };
});

export const createUnshieldingTransferAtom = atomWithMutation((get) => {
  const chain = get(chainAtom);
  return {
    mutationKey: ["create-unshielding-transfer-tx"],
    enabled: chain.isSuccess,
    mutationFn: async ({
      params,
      gasConfig,
      account,
    }: BuildTxAtomParams<UnshieldingTransferMsgValue>) =>
      createUnshieldingTransferTx(chain.data!, account, params, gasConfig),
  };
});
