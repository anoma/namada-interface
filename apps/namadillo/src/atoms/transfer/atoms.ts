import {
  ShieldedTransferMsgValue,
  ShieldingTransferMsgValue,
  TransparentTransferMsgValue,
  UnshieldingTransferMsgValue,
} from "@namada/types";
import { chainAtom } from "atoms/chain";
import { rpcUrlAtom } from "atoms/settings";
import invariant from "invariant";
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
      memo,
    }: BuildTxAtomParams<TransparentTransferMsgValue>) => {
      return createTransparentTransferTx(
        chain.data!,
        account,
        params,
        gasConfig,
        memo
      );
    },
  };
});

export const createShieldedTransferAtom = atomWithMutation((get) => {
  const chain = get(chainAtom);
  const rpcUrl = get(rpcUrlAtom);

  return {
    mutationKey: ["create-shielded-transfer-tx"],
    enabled: chain.isSuccess,
    mutationFn: async ({
      params,
      gasConfig,
      account,
      memo,
      signer,
    }: BuildTxAtomParams<ShieldedTransferMsgValue>) => {
      invariant(signer, "Disposable signer is required for shielded transfers");
      return createShieldedTransferTx(
        chain.data!,
        account,
        params,
        gasConfig,
        rpcUrl,
        signer,
        memo
      );
    },
  };
});

export const createShieldingTransferAtom = atomWithMutation((get) => {
  const chain = get(chainAtom);
  const rpcUrl = get(rpcUrlAtom);
  return {
    mutationKey: ["create-shielding-transfer-tx"],
    enabled: chain.isSuccess,
    mutationFn: async ({
      params,
      gasConfig,
      account,
      memo,
    }: BuildTxAtomParams<ShieldingTransferMsgValue>) =>
      createShieldingTransferTx(
        chain.data!,
        account,
        params,
        gasConfig,
        rpcUrl,
        memo
      ),
  };
});

export const createUnshieldingTransferAtom = atomWithMutation((get) => {
  const chain = get(chainAtom);
  const rpcUrl = get(rpcUrlAtom);
  return {
    mutationKey: ["create-unshielding-transfer-tx"],
    enabled: chain.isSuccess,
    mutationFn: async ({
      params,
      gasConfig,
      account,
      signer,
      memo,
    }: BuildTxAtomParams<UnshieldingTransferMsgValue>) => {
      invariant(
        signer,
        "Disposable signer is required for unshielding transfers"
      );
      return createUnshieldingTransferTx(
        chain.data!,
        account,
        params,
        gasConfig,
        rpcUrl,
        signer,
        memo
      );
    },
  };
});
