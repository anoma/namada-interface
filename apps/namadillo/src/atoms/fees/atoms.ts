import { GasPriceTableInner } from "@namada/indexer-client";
import { defaultAccountAtom } from "atoms/accounts";
import { indexerApiAtom } from "atoms/api";
import { chainAssetsMapAtom, nativeTokenAddressAtom } from "atoms/chain";
import { queryDependentFn } from "atoms/utils";
import BigNumber from "bignumber.js";
import invariant from "invariant";
import { atom, getDefaultStore } from "jotai";
import { atomWithQuery } from "jotai-tanstack-query";
import { atomFamily, atomWithStorage, RESET } from "jotai/utils";
import { isPublicKeyRevealed } from "lib/query";
import { Address, GasConfig, GasTable } from "types";
import { TxKind } from "types/txKind";
import {
  fetchGasLimit,
  fetchGasPriceForAllTokens,
  fetchMinimumGasPrice,
} from "./services";

export const storageGasTokenAtom = atomWithStorage<string | undefined>(
  "namadillo:gasToken",
  undefined
);

export const gasTokenAtom = atom<Address | undefined>((get) => {
  const storageGasToken = get(storageGasTokenAtom);
  const nativeTokenQuery = get(nativeTokenAddressAtom);
  return storageGasToken ?? nativeTokenQuery.data;
});

export const gasLimitsAtom = atomWithQuery<GasTable>((get) => {
  const api = get(indexerApiAtom);
  return {
    queryKey: ["minimum-gas-limits"],
    queryFn: async () => fetchGasLimit(api),
  };
});

export const gasPriceForAllTokensAtom = atomWithQuery<GasPriceTableInner[]>(
  (get) => {
    const api = get(indexerApiAtom);
    return {
      queryKey: ["gas-price-for-all-tokens"],
      queryFn: () => fetchGasPriceForAllTokens(api),
    };
  }
);

export const minimumGasPriceAtom = atomWithQuery<BigNumber>((get) => {
  const api = get(indexerApiAtom);
  const gasToken = get(gasTokenAtom);
  const namTokenAddressQuery = get(nativeTokenAddressAtom);

  return {
    queryKey: ["minimum-gas-price", gasToken, namTokenAddressQuery.data],
    queryFn: async () => {
      try {
        invariant(gasToken, "Cannot query minimum gas for undefined token");

        const tokenCost = (await fetchMinimumGasPrice(api, gasToken))[0];
        if (!tokenCost) {
          // if the selected token is not available on the chain,
          // reset the storage so we can use the default token as fallback
          const { set } = getDefaultStore();
          set(storageGasTokenAtom, RESET);
        }
        invariant(tokenCost, "Error querying minimum gas price");

        return BigNumber(tokenCost.minDenomAmount);
      } catch (e) {
        // if something goes wrong when querying the gas price,
        // reset the storage so we can use the default token as fallback
        const { set } = getDefaultStore();
        set(storageGasTokenAtom, RESET);
        throw e;
      }
    },
  };
});

export const defaultGasConfigFamily = atomFamily(
  (txKinds: TxKind[]) =>
    atomWithQuery<GasConfig>((get) => {
      const defaultAccount = get(defaultAccountAtom);
      const minimumGasPrice = get(minimumGasPriceAtom);
      const gasLimitsTable = get(gasLimitsAtom);
      const gasToken = get(gasTokenAtom);
      const chainAssetsMap = get(chainAssetsMapAtom);

      return {
        queryKey: [
          "default-gas-config",
          defaultAccount.data?.address,
          minimumGasPrice.data,
          gasLimitsTable.data,
          gasToken,
        ],
        ...queryDependentFn(async () => {
          invariant(
            gasLimitsTable.data,
            "Cannot create a gas config without a gas limit"
          );
          invariant(
            minimumGasPrice.data,
            "Cannot create a gas config without a gas price"
          );
          invariant(gasToken, "Cannot create a gas config without a token");

          const publicKeyRevealed =
            defaultAccount.data?.address ?
              await isPublicKeyRevealed(defaultAccount.data.address)
            : false;

          const txKindsWithRevealPk =
            publicKeyRevealed ? txKinds : ["RevealPk" as const, ...txKinds];

          const gasLimit = txKindsWithRevealPk.reduce(
            (total, kind) => total.plus(gasLimitsTable.data[kind].native),
            BigNumber(0)
          );

          invariant(gasToken, "Cannot create a gas config without a token");

          return {
            gasLimit,
            gasPrice: minimumGasPrice.data,
            gasToken,
            asset: chainAssetsMap[gasToken],
          };
        }, [defaultAccount, minimumGasPrice, gasLimitsTable]),
      };
    }),
  // Hacky way to compare two objects
  (a, b) => JSON.stringify(a) === JSON.stringify(b)
);
