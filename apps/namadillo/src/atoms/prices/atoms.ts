import { atomWithQuery } from "jotai-tanstack-query";
import { atomFamily } from "jotai/utils";
import isEqual from "lodash.isequal";
import { Address } from "types";
import { fetchTokenPrices } from "./functions";

export const tokenPricesFamily = atomFamily(
  (addresses: Address[]) =>
    atomWithQuery(() => {
      return {
        queryKey: ["token-prices", addresses],
        queryFn: () => fetchTokenPrices(addresses),
      };
    }),
  isEqual
);
