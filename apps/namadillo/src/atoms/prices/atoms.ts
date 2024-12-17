import { chainTokensAtom } from "atoms/chain/atoms";
import { atomWithQuery } from "jotai-tanstack-query";
import { atomFamily } from "jotai/utils";
import { Address } from "types";
import { fetchTokenPrices } from "./functions";

export const tokenPricesFamily = atomFamily(
  (addresses: Address[]) =>
    atomWithQuery((get) => {
      const chainTokens = get(chainTokensAtom).data;
      return {
        queryKey: ["token-prices", addresses, chainTokens],
        queryFn: () => fetchTokenPrices(addresses, chainTokens ?? []),
      };
    }),
  // Hacky way to compare two objects
  (a, b) => JSON.stringify(a) === JSON.stringify(b)
);
