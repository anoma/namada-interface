import { defaultAccountAtom } from "atoms/accounts";
import { indexerApiAtom } from "atoms/api";
import { nativeTokenAddressAtom } from "atoms/chain";
import { queryDependentFn } from "atoms/utils";
import BigNumber from "bignumber.js";
import { atom } from "jotai";
import { atomWithQuery } from "jotai-tanstack-query";
import { atomFamily } from "jotai/utils";
import { isPublicKeyRevealed } from "lib/query";
import { GasConfig, GasTable } from "types";
import { TxKind } from "types/txKind";
import { fetchGasLimit, fetchMinimumGasPrice } from "./services";

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
