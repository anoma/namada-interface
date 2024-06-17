import { GasLimitTableInnerTxKindEnum as GasLimitTableIndexer } from "@anomaorg/namada-indexer-client";
import BigNumber from "bignumber.js";
import invariant from "invariant";
import { atom } from "jotai";
import { atomWithQuery } from "jotai-tanstack-query";
import { indexerApiAtom } from "./api";
import { nativeTokenAtom } from "./settings";

export type TxKind =
  | "Bond"
  | "Unbond"
  | "Redelegation"
  | "Withdraw"
  | "ClaimRewards"
  | "VoteProposal"
  | "Unknown";

const txKindFromIndexerTxKind = (
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

type GasLimit = BigNumber;
type Token = string;

export type TxGas = Record<Token, GasLimit>;

export type GasTable = Record<TxKind, TxGas>;

export const gasLimitsAtom = atomWithQuery<GasTable>((get) => {
  const api = get(indexerApiAtom);

  return {
    queryKey: ["minimum-gas-limits"],
    queryFn: async () => {
      const gasTableResponse = await api.apiV1GasTokenGet("native");
      const gasTable = gasTableResponse.data.reduce(
        (acc, { gasLimit, txKind: indexerTxKind }) => {
          const txKind = txKindFromIndexerTxKind(indexerTxKind);
          if (txKind) {
            const perKind = acc[txKind] || {};

            acc[txKind] = { ...perKind, native: new BigNumber(gasLimit) };
          }

          return acc;
        },
        {} as GasTable
      );

      return gasTable;
    },
  };
});

export const gasCostTxKindAtom = atom<TxKind | undefined>(undefined);

export const minimumGasPriceAtom = atomWithQuery<BigNumber>((get) => {
  const nativeToken = get(nativeTokenAtom);
  const api = get(indexerApiAtom);

  return {
    queryKey: ["minimum-gas-price", nativeToken],
    queryFn: async () => {
      const gasTableResponse = await api.apiV1GasPriceTokenGet(nativeToken);

      // TODO: Can nativeToken ever be undefined?
      invariant(!!nativeToken, "Native token is undefined");
      const nativeTokenCost = gasTableResponse.data.find(
        ({ token }) => token === nativeToken
      );
      invariant(!!nativeTokenCost, "Error querying minimum gas price");
      const asBigNumber = new BigNumber(nativeTokenCost.amount);
      invariant(
        !asBigNumber.isNaN(),
        "Error converting minimum gas price to BigNumber"
      );
      return asBigNumber;
    },
  };
});
