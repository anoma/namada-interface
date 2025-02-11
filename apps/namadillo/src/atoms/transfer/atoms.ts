import {
  DatedViewingKey,
  ShieldedTransferMsgValue,
  ShieldingTransferMsgValue,
  TransparentTransferMsgValue,
  UnshieldingTransferMsgValue,
} from "@namada/types";
import { shieldedSyncProgress, viewingKeysAtom } from "atoms/balance";
import { shieldedSync } from "atoms/balance/services";
import {
  chainAtom,
  chainParametersAtom,
  nativeTokenAddressAtom,
} from "atoms/chain";
import { maspIndexerUrlAtom, rpcUrlAtom } from "atoms/settings";
import invariant from "invariant";
import { getDefaultStore, Getter } from "jotai";
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
  const { rpcUrl, maspIndexerUrl, allViewingKeys, namTokenAddress, chainId } =
    getProps(get);

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

      await sync(
        allViewingKeys,
        chainId,
        namTokenAddress,
        rpcUrl,
        maspIndexerUrl
      );

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
  const { rpcUrl, maspIndexerUrl, allViewingKeys, namTokenAddress, chainId } =
    getProps(get);

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

      await sync(
        allViewingKeys,
        chainId,
        namTokenAddress,
        rpcUrl,
        maspIndexerUrl
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

const getProps = (
  get: Getter
): {
  rpcUrl: string;
  maspIndexerUrl: string;
  allViewingKeys: DatedViewingKey[] | undefined;
  namTokenAddress: string | undefined;
  chainId: string | undefined;
} => {
  const rpcUrl = get(rpcUrlAtom);
  const maspIndexerUrl = get(maspIndexerUrlAtom);
  const namTokenAddressQuery = get(nativeTokenAddressAtom);
  const viewingKeysQuery = get(viewingKeysAtom);
  const chainParametersQuery = get(chainParametersAtom);

  const [_, allViewingKeys] = viewingKeysQuery.data ?? [];
  const namTokenAddress = namTokenAddressQuery.data;
  const chainId = chainParametersQuery.data?.chainId;

  return {
    rpcUrl,
    maspIndexerUrl,
    allViewingKeys,
    namTokenAddress,
    chainId,
  };
};

const sync = async (
  allViewingKeys: DatedViewingKey[] | undefined,
  chainId: string | undefined,
  namTokenAddress: string | undefined,
  rpcUrl: string | undefined,
  maspIndexerUrl: string | undefined
): Promise<void> => {
  invariant(allViewingKeys, "Viewing keys are required for shielded sync");
  invariant(chainId, "Chain ID is required for shielded sync");
  invariant(namTokenAddress, "NAM token address is required for shielded sync");
  invariant(rpcUrl, "RPC URL is required for shielded sync");
  invariant(maspIndexerUrl, "Masp indexer URL is required for shielded sync");

  const { set } = getDefaultStore();
  await shieldedSync({
    rpcUrl,
    maspIndexerUrl,
    token: namTokenAddress,
    viewingKeys: allViewingKeys,
    chainId,
    onProgress: (perc) => set(shieldedSyncProgress, perc),
  });
};
