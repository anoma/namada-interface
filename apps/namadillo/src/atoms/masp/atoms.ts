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
import { unknownAsset } from "registry/unknownAsset";
import { getSdkInstance } from "utils/sdk";
import { fetchCoinPrices } from "./services";

export type TokenBalance = {
  denom: string;
  address: string;
  amount: string;
};

export type TokenBalanceWithFiat = TokenBalance & {
  asset?: Asset;
  dollar?: BigNumber;
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
  const enablePolling = get(shouldUpdateBalanceAtom);
  const viewingKeyQuery = get(viewingKeyAtom);
  const tokenAddressesQuery = get(tokenAddressesAtom);
  const namTokenAddressQuery = get(nativeTokenAddressAtom);

  return {
    refetchInterval: enablePolling ? 1000 : false,
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
      // response.push(["tnam1qy440ynh9fwrx8aewjvvmu38zxqgukgc259fzp6h", "100"]); // 100 nam
      // response.push(["tnam1p5nnjnasjtfwen2kzg78fumwfs0eycqpecuc2jwz", "10"]); // 10 atom
      // response.push(["unknown", "1"]); // 1 unknown token

      const addressToDenom = {
        [namTokenAddress]: "nam",
      };
      tokenAddresses.forEach((token) => {
        if ("trace" in token) {
          const denom = token.trace.split("/").at(-1) ?? token.trace;
          addressToDenom[token.address] = denom;
        }
      });
      return response.map(([address, amount]) => ({
        denom: addressToDenom[address] ?? address,
        address,
        amount,
      }));
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
        unit.aliases?.forEach((alias) => {
          if (!assetsByDenom[alias]) {
            assetsByDenom[alias] = asset;
          }
        });
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
      const pricesByDenom: Record<string, number> = {
        // TODO define how to get the nam's price
        // nam: 1,
      };
      Object.entries(pricesById).forEach(([id, { usd }]) => {
        const denom = denomById[id];
        pricesByDenom[denom] = usd;
      });
      return pricesByDenom;
    }, [shieldedBalanceQuery]),
  };
});

export const shieldedBalanceWithFiatAtom = atomWithQuery<
  TokenBalanceWithFiat[]
>((get) => {
  const shieldedBalanceQuery = get(shieldedBalanceAtom);
  const assetsByDenom = get(assetsByDenomAtom);
  const fiatPriceMapQuery = get(fiatPriceMapAtom);

  return {
    queryKey: [
      "shielded-balance",
      shieldedBalanceQuery.data,
      fiatPriceMapQuery.data,
    ],
    ...queryDependentFn(async () => {
      const findExpoent = (asset: Asset, denom: string): number =>
        asset.denom_units.find(
          (unit) => unit.denom === denom || unit.aliases?.includes(denom)
        )?.exponent ?? 0;

      return (
        shieldedBalanceQuery.data?.map((item) => {
          const { denom, amount } = item;
          const asset = assetsByDenom[denom] ?? unknownAsset;
          const display = asset.display;

          const expoentInput = findExpoent(asset, denom);
          const expoentOutput = findExpoent(asset, display);
          const expoent = expoentOutput - expoentInput;

          const balance = new BigNumber(amount).dividedBy(
            Math.pow(10, expoent)
          );

          const fiatValue = fiatPriceMapQuery.data?.[denom];
          const dollar =
            fiatValue ? balance.multipliedBy(fiatValue) : undefined;

          return {
            ...item,
            dollar,
          };
        }) ?? []
      );
    }, [shieldedBalanceQuery, fiatPriceMapQuery]),
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
