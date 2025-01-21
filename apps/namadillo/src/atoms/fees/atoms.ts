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
import { toDisplayAmount } from "utils";
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
          const counter = (kind: TxKind): number | undefined =>
            txKinds.filter((i) => i === kind).length || undefined;
          return fetchGasEstimate(api, [
            counter("Bond"),
            counter("ClaimRewards"),
            counter("Unbond"),
            counter("TransparentTransfer"),
            counter("ShieldedTransfer"),
            counter("ShieldingTransfer"),
            counter("UnshieldingTransfer"),
            counter("VoteProposal"),
            counter("IbcTransfer"),
            counter("Withdraw"),
            counter("RevealPk"),
            counter("Redelegate"),
          ]);
        },
      };
    }),
  isEqual
);

export const gasPriceTableAtom = atomWithQuery<GasPriceTable>((get) => {
  const api = get(indexerApiAtom);
  const chainAssetsMap = get(chainAssetsMapAtom);

  return {
    queryKey: ["gas-price-table"],
    ...queryDependentFn(async () => {
      const response = await fetchTokensGasPrice(api);
      return response.map(({ token, minDenomAmount }) => {
        const asset = chainAssetsMap[token];
        const baseAmount = BigNumber(minDenomAmount);
        return {
          token,
          // TODO should we run `toDisplayAmount` for all tokens or only NAM?
          gasPrice: asset ? toDisplayAmount(asset, baseAmount) : baseAmount,
        };
      });
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
