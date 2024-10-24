import { Asset } from "@chain-registry/types";
import { accountsAtom, defaultAccountAtom } from "atoms/accounts/atoms";
import { nativeTokenAddressAtom, tokenAddressesAtom } from "atoms/chain";
import { shouldUpdateBalanceAtom } from "atoms/etc";
import { availableAssetsAtom } from "atoms/integrations";
import { queryDependentFn } from "atoms/utils";
import BigNumber from "bignumber.js";
import { atom } from "jotai";
import { atomWithQuery } from "jotai-tanstack-query";
import { namadaAsset } from "registry/namadaAsset";
import { getSdkInstance } from "utils/sdk";
import { fetchCoinPrices } from "./services";

export type TokenBalance = {
  denom: string;
  amount: string;
};

export const viewingKeyAtom = atomWithQuery<string>((get) => {
  const accountsQuery = get(accountsAtom);
  const defaultAccountQuery = get(defaultAccountAtom);

  return {
    queryKey: ["viewing-key"],
    ...queryDependentFn(async () => {
      const shieldedAccount = accountsQuery.data?.find(
        (a) => a.isShielded && a.alias === defaultAccountQuery.data?.alias
      );
      return shieldedAccount?.viewingKey ?? "";
    }, [accountsQuery, defaultAccountQuery]),
  };
});

export const shieldedBalanceAtom = atomWithQuery<TokenBalance[]>((get) => {
  const viewingKeyQuery = get(viewingKeyAtom);
  const tokenAddressesQuery = get(tokenAddressesAtom);
  const namTokenAddressQuery = get(nativeTokenAddressAtom);

  return {
    queryKey: [
      "shielded-balance",
      viewingKeyQuery.data,
      tokenAddressesQuery.data,
      namTokenAddressQuery.data,
    ],
    ...queryDependentFn(async () => {
      const viewingKey = viewingKeyQuery.data;
      const tokenAddresses = tokenAddressesQuery.data;
      const namTokenAddress = namTokenAddressQuery.data;
      if (!viewingKey || !tokenAddresses || !namTokenAddress) {
        return [];
      }

      const sdk = await getSdkInstance();
      await sdk.rpc.shieldedSync([viewingKey]);
      const response = await sdk.rpc.queryBalance(
        viewingKey,
        tokenAddresses.map((t) => t.address)
      );

      // TODO mock
      response.push(["tnam1p5nnjnasjtfwen2kzg78fumwfs0eycqpecuc2jwz", "1"]); // 1 atom
      response.push(["unknown", "1"]);

      const addressToDenom = {
        [namTokenAddress]: "nam",
      };
      tokenAddresses.forEach((token) => {
        if ("trace" in token) {
          const denom = token.trace.split("/").at(-1) ?? token.trace;
          addressToDenom[token.address] = denom;
        }
      });
      const balance = response.map(([address, amount]) => ({
        denom: addressToDenom[address] ?? address,
        amount,
      }));
      return balance;
    }, [viewingKeyQuery, tokenAddressesQuery, namTokenAddressQuery]),
  };
});

export const assetsByDenomAtom = atom((get) => {
  const availableAssets = get(availableAssetsAtom);
  const assetsByDenom: Record<string, Asset> = {
    // TODO namAsset should be returned from availableAssetsAtom
    nam: namadaAsset,
  };
  availableAssets.forEach((assets) => {
    assets.assets.forEach((asset) => {
      asset.denom_units.forEach((unit) => {
        // only set the asset if it doesn't exists
        // otherwise the testnet will override the mainnet
        if (!assetsByDenom[unit.denom]) {
          assetsByDenom[unit.denom] = asset;
        }
      });
    });
  });
  return assetsByDenom;
});

export const fiatPriceMapAtom = atomWithQuery((get) => {
  const shieldedBalanceQuery = get(shieldedBalanceAtom);
  const assetsByDenom = get(assetsByDenomAtom);

  return {
    queryKey: ["fiat-price-map", shieldedBalanceQuery.data],
    ...queryDependentFn(async () => {
      const denomById: Record<string, string> = {};
      const ids: string[] = [];
      shieldedBalanceQuery.data?.forEach(({ denom }) => {
        const id = assetsByDenom[denom]?.coingecko_id;
        if (id) {
          denomById[id] = denom;
          ids.push(id);
        }
      });
      const pricesById = await fetchCoinPrices(ids);
      const pricesByDenom: Record<string, number> = {};
      Object.entries(pricesById).forEach(([id, { usd }]) => {
        const denom = denomById[id];
        pricesByDenom[denom] = usd;
      });
      return pricesByDenom;
    }, [shieldedBalanceQuery]),
  };
});

export const totalShieldedBalanceAtom = atomWithQuery<BigNumber>((get) => {
  const enablePolling = get(shouldUpdateBalanceAtom);
  const shieldedBalanceQuery = get(shieldedBalanceAtom);

  return {
    refetchInterval: enablePolling ? 1000 : false,
    queryKey: ["total-shielded-balance"],
    ...queryDependentFn(async () => {
      if (!shieldedBalanceQuery.data?.length) {
        return new BigNumber(0);
      }
      // TODO convert to fiat values
      return BigNumber.sum(
        ...shieldedBalanceQuery.data.map(({ amount }) => amount)
      );
    }, [shieldedBalanceQuery]),
  };
});

export const namShieldedBalanceAtom = atomWithQuery<BigNumber>((get) => {
  const namTokenAddressQuery = get(nativeTokenAddressAtom);
  const enablePolling = get(shouldUpdateBalanceAtom);
  const shieldedBalanceQuery = get(shieldedBalanceAtom);

  return {
    refetchInterval: enablePolling ? 1000 : false,
    queryKey: ["nam-shielded-balance"],
    ...queryDependentFn(async () => {
      const namTokenAddress = namTokenAddressQuery.data;
      if (!shieldedBalanceQuery.data?.length || !namTokenAddress) {
        return new BigNumber(0);
      }
      return BigNumber.sum(
        ...shieldedBalanceQuery.data
          .filter(({ denom }) => denom === "nam")
          .map(({ amount }) => amount)
      );
    }, [shieldedBalanceQuery]),
  };
});
