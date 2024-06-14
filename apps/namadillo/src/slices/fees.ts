import { GasLimitTableInnerTxKindEnum as GasLimitTableIndexer } from "@anomaorg/namada-indexer-client";
import BigNumber from "bignumber.js";
import invariant from "invariant";
import { Atom, atom } from "jotai";
import { AtomWithQueryResult, atomWithQuery } from "jotai-tanstack-query";
import { indexerApiAtom } from "./api";
import { nativeTokenAtom } from "./settings";

export type TxKind =
  | "Bond"
  | "Unbond"
  | "Redelegation"
  | "Withdraw"
  | "ClaimRewards"
  | "VoteProposal";

const txKindFromIndexerTxKind = (txKind: GasLimitTableIndexer): TxKind => {
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
      throw new Error(`Unknown txKind: ${txKind}`);
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
        (acc, { token, gasLimit, txKind: indexerTxKind }) => {
          const txKind = txKindFromIndexerTxKind(indexerTxKind);
          const perKind = acc[txKind] || {};

          acc[txKind] = { ...perKind, [token]: new BigNumber(gasLimit) };

          return acc;
        },
        {} as GasTable
      );

      return gasTable;
    },
  };
});

export const gasCostTxKindAtom = atom<TxKind | undefined>(undefined);

export const gasLimitAtom = (
  txKind: TxKind
): Atom<AtomWithQueryResult<BigNumber>> => {
  // TODO: for now we hardcode 'native'
  const token = "native";

  return atomWithQuery<BigNumber>((get) => {
    const gasLimits = get(gasLimitsAtom);

    return {
      queryKey: ["minimum-gas-limit", txKind, token],
      enabled: gasLimits.isSuccess && !!txKind,
      queryFn: () => {
        return gasLimits.data![txKind][token];
      },
    };
  });
};

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
