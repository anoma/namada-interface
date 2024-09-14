import { GasLimitTableInnerTxKindEnum as GasLimitTableIndexer } from "@anomaorg/namada-indexer-client";
import { defaultAccountAtom } from "atoms/accounts";
import { indexerApiAtom } from "atoms/api";
import { nativeTokenAddressAtom } from "atoms/chain";
import { queryDependentFn } from "atoms/utils";
import BigNumber from "bignumber.js";
import { atom } from "jotai";
import { atomWithQuery } from "jotai-tanstack-query";
import { atomFamily } from "jotai/utils";
import { isPublicKeyRevealed } from "lib/query";
import { GasConfig, GasTable, TxKind } from "types";
import { fetchGasLimit, fetchMinimumGasPrice } from "./services";

// TODO: I think we should find a better solution for this
export const txKindFromIndexer = (
  txKind: GasLimitTableIndexer
): TxKind | undefined => {
  switch (txKind) {
    case GasLimitTableIndexer.Bond:
      return "Bond";
    case GasLimitTableIndexer.Unbond:
      return "Unbond";
    case GasLimitTableIndexer.Redelegation:
      return "Redelegate";
    case GasLimitTableIndexer.Withdraw:
      return "Withdraw";
    case GasLimitTableIndexer.ClaimRewards:
      return "ClaimRewards";
    case GasLimitTableIndexer.VoteProposal:
      return "VoteProposal";
    case GasLimitTableIndexer.RevealPk:
      return "RevealPk";
    default:
      return undefined;
  }
};

export const gasCostTxKindAtom = atom<TxKind | undefined>(undefined);

export const gasLimitsAtom = atomWithQuery<GasTable>((get) => {
  const api = get(indexerApiAtom);
  return {
    queryKey: ["minimum-gas-limits"],
    queryFn: async () => fetchGasLimit(api),
  };
});

export const minimumGasPriceAtom = atomWithQuery<BigNumber>((get) => {
  const api = get(indexerApiAtom);
  const nativeTokenQuery = get(nativeTokenAddressAtom);
  return {
    queryKey: ["minimum-gas-price", nativeTokenQuery.data],
    ...queryDependentFn(
      async () => fetchMinimumGasPrice(api, nativeTokenQuery.data!),
      [nativeTokenQuery]
    ),
  };
});

export const defaultGasConfigFamily = atomFamily(
  (txKinds: TxKind[]) =>
    atomWithQuery<GasConfig>((get) => {
      const defaultAccount = get(defaultAccountAtom);
      const minimumGasPrice = get(minimumGasPriceAtom);
      const gasLimitsTable = get(gasLimitsAtom);

      return {
        queryKey: [
          "default-gas-config",
          defaultAccount.data?.address,
          minimumGasPrice.data,
          gasLimitsTable.data,
        ],
        ...queryDependentFn(async () => {
          const publicKeyRevealed = await isPublicKeyRevealed(
            defaultAccount.data!.address
          );

          const txKindsWithRevealPk =
            publicKeyRevealed ? txKinds : ["RevealPk" as const, ...txKinds];

          const gasLimit = txKindsWithRevealPk.reduce(
            (total, kind) => total.plus(gasLimitsTable.data![kind].native),
            BigNumber(0)
          );

          return {
            gasLimit,
            gasPrice: minimumGasPrice.data!,
          };
        }, [defaultAccount, minimumGasPrice, gasLimitsTable]),
      };
    }),
  // Hacky way to compare two objects
  (a, b) => JSON.stringify(a) === JSON.stringify(b)
);
