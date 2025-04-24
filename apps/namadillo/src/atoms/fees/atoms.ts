import { GasEstimate } from "@namada/indexer-client";
import { defaultAccountAtom } from "atoms/accounts";
import { indexerApiAtom } from "atoms/api";
import { chainAssetsMapAtom } from "atoms/chain";
import { queryDependentFn } from "atoms/utils";
import BigNumber from "bignumber.js";
import { atomWithQuery } from "jotai-tanstack-query";
import { atomFamily } from "jotai/utils";
import { isPublicKeyRevealed } from "lib/query";
import isEqual from "lodash.isequal";
import { Address } from "types";
import { TxKind } from "types/txKind";
import { isNamadaAsset, toDisplayAmount } from "utils";
import { fetchGasEstimate, fetchTokensGasPrice } from "./services";

export type GasPriceTableItem = {
  token: Address;
  gasPrice: BigNumber;
};

export type GasPriceTable = GasPriceTableItem[];

export const gasEstimateFamily = atomFamily(
  (txKinds: TxKind[]) =>
    atomWithQuery<GasEstimate>((get) => {
      const api = get(indexerApiAtom);
      return {
        queryKey: ["gas-limit", txKinds],
        queryFn: async () => {
          if (!txKinds.length) {
            return {
              min: 0,
              max: 0,
              avg: 0,
              totalEstimates: 0,
            };
          }

          const gasEstimate = await fetchGasEstimate(api, txKinds);
          const precision = Math.max(
            0,
            Math.min(1, gasEstimate.totalEstimates / 1000)
          );
          return {
            min: Math.ceil(gasEstimate.min * 1.1 - precision * 0.1),
            avg: Math.ceil(gasEstimate.avg * 1.25 - precision * 0.25),
            max: Math.ceil(gasEstimate.max * 1.5 - precision * 0.5),
            totalEstimates: gasEstimate.totalEstimates,
          };
        },
      };
    }),
  isEqual
);

export const gasPriceTableAtom = atomWithQuery<GasPriceTable>((get) => {
  const api = get(indexerApiAtom);
  const chainAssetsMap = get(chainAssetsMapAtom);

  return {
    queryKey: ["gas-price-table", chainAssetsMap],
    ...queryDependentFn(async () => {
      const response = await fetchTokensGasPrice(api);
      return (
        response
          // filter only tokens that exists on the chain
          .filter(({ token }) => Boolean(chainAssetsMap[token]))
          .map(({ token, minDenomAmount }) => {
            const asset = chainAssetsMap[token];
            const baseAmount = BigNumber(minDenomAmount);
            return {
              token,
              gasPrice:
                asset && isNamadaAsset(asset) ?
                  toDisplayAmount(asset, baseAmount)
                : baseAmount,
            };
          })
      );
    }, []),
  };
});

export const isPublicKeyRevealedAtom = atomWithQuery<boolean>((get) => {
  const defaultAccount = get(defaultAccountAtom);
  const accountAddress = defaultAccount.data?.address;
  return {
    queryKey: ["default-gas-config", accountAddress],
    ...queryDependentFn(async () => {
      return accountAddress ? await isPublicKeyRevealed(accountAddress) : false;
    }, [defaultAccount]),
  };
});
