import { GasLimitTableInnerTxKindEnum as GasLimitTableIndexer } from "@anomaorg/namada-indexer-client";
import { indexerApiAtom } from "atoms/api";
import { nativeTokenAddressAtom } from "atoms/chain";
import { queryDependentFn } from "atoms/utils";
import BigNumber from "bignumber.js";
import { atom } from "jotai";
import { atomWithQuery } from "jotai-tanstack-query";
import { GasTable, TxKind } from "types";
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
      return "Redelegation";
    case GasLimitTableIndexer.Withdraw:
      return "Withdraw";
    case GasLimitTableIndexer.ClaimRewards:
      return "ClaimRewards";
    case GasLimitTableIndexer.VoteProposal:
      return "VoteProposal";
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
