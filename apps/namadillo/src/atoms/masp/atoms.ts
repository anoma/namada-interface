import { Asset } from "@chain-registry/types";
import { Balance } from "@heliaxdev/namada-sdk/web";
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
import { findExpoent } from "utils/registry";
import { getSdkInstance } from "utils/sdk";
import { sumDollars } from "./functions";
import { fetchCoinPrices } from "./services";

export type TokenBalance = {
  address: string;
  amount: string;
  denom: string;
  asset: Asset;
  balance: BigNumber;
  dollar?: BigNumber;
};

// TODO import from namada-chain-registry
const NAM_DENOM = "nam";

export const viewingKeyAtom = atomWithQuery<string>((get) => {
  const accountsQuery = get(accountsAtom);
  const defaultAccountQuery = get(defaultAccountAtom);

  return {
    queryKey: ["viewing-key", accountsQuery.data, defaultAccountQuery.data],
    ...queryDependentFn(async () => {
      const shieldedAccount = accountsQuery.data?.find(
        (a) => a.isShielded && a.alias === defaultAccountQuery.data?.alias
      );
      return shieldedAccount?.viewingKey ?? "";
    }, [accountsQuery, defaultAccountQuery]),
  };
});

export const shieldedBalanceAtom = atomWithQuery<Balance>((get) => {
  const enablePolling = get(shouldUpdateBalanceAtom);
  const viewingKeyQuery = get(viewingKeyAtom);
  const tokenAddressesQuery = get(tokenAddressesAtom);

  return {
    refetchInterval: enablePolling ? 1000 : false,
    queryKey: [
      "shielded-balance",
      viewingKeyQuery.data,
      tokenAddressesQuery.data,
    ],
    ...queryDependentFn(async () => {
      const viewingKey = viewingKeyQuery.data;
      const tokenAddresses = tokenAddressesQuery.data;
      if (!viewingKey || !tokenAddresses) {
        return [];
      }
      // TODO mock
      // return [
      //   ["tnam1qy440ynh9fwrx8aewjvvmu38zxqgukgc259fzp6h", "37"], // nam
      //   ["tnam1p5nnjnasjtfwen2kzg78fumwfs0eycqpecuc2jwz", "4"], // uatom
      //   ["unknown", "1"], // 1 unknown token
      // ];
      const sdk = await getSdkInstance();
      await sdk.rpc.shieldedSync([viewingKey]);
      return await sdk.rpc.queryBalance(
        viewingKey,
        tokenAddresses.map((t) => t.address)
      );
    }, [viewingKeyQuery, tokenAddressesQuery]),
  };
});

export const denomByAddressAtom = atomWithQuery((get) => {
  const tokenAddressesQuery = get(tokenAddressesAtom);
  const namTokenAddressQuery = get(nativeTokenAddressAtom);

  return {
    queryKey: [
      "denom-by-address",
      tokenAddressesQuery.data,
      namTokenAddressQuery.data,
    ],
    ...queryDependentFn(async () => {
      const addressToDenom: Record<string, string> = {};
      if (namTokenAddressQuery.data) {
        addressToDenom[namTokenAddressQuery.data] = NAM_DENOM;
      }
      tokenAddressesQuery.data?.forEach((token) => {
        if ("trace" in token) {
          const denom = token.trace.split("/").at(-1) ?? token.trace;
          addressToDenom[token.address] = denom;
        }
      });
      return addressToDenom;
    }, [tokenAddressesQuery, namTokenAddressQuery]),
  };
});

export const assetsByDenomAtom = atom((get) => {
  const availableAssets = get(availableAssetsAtom);
  const assetsByDenom: Record<string, Asset> = {
    // TODO namAsset should be returned from availableAssetsAtom
    [NAM_DENOM]: namadaAsset,
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

export const tokenPriceAtom = atomWithQuery((get) => {
  const shieldedBalanceQuery = get(shieldedBalanceAtom);
  const denomByAddressQuery = get(denomByAddressAtom);
  const assetsByDenom = get(assetsByDenomAtom);

  return {
    queryKey: [
      "token-price",
      shieldedBalanceQuery.data,
      denomByAddressQuery.data,
    ],
    ...queryDependentFn(async () => {
      const denomById: Record<string, string> = {};
      const ids: string[] = [];
      shieldedBalanceQuery.data?.forEach(([address]) => {
        const denom = denomByAddressQuery.data?.[address];
        const id = denom && assetsByDenom[denom]?.coingecko_id;
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
    }, [shieldedBalanceQuery, denomByAddressQuery]),
  };
});

export const shieldedTokensAtom = atomWithQuery<TokenBalance[]>((get) => {
  const shieldedBalanceQuery = get(shieldedBalanceAtom);
  const denomByAddressQuery = get(denomByAddressAtom);
  const assetsByDenom = get(assetsByDenomAtom);
  const tokenPriceQuery = get(tokenPriceAtom);

  return {
    queryKey: [
      "shielded-tokens",
      shieldedBalanceQuery.data,
      denomByAddressQuery.data,
      tokenPriceQuery.data,
    ],
    ...queryDependentFn(async () => {
      if (!shieldedBalanceQuery.data || !denomByAddressQuery.data) {
        return [];
      }
      return shieldedBalanceQuery.data.map(([address, amount]) => {
        const denom = denomByAddressQuery.data[address] ?? unknownAsset.display;
        const asset = assetsByDenom[denom] ?? unknownAsset;
        const display = asset.display;

        const expoentInput = findExpoent(asset, denom);
        const expoentOutput = findExpoent(asset, display);
        const expoent = expoentOutput - expoentInput;

        const balance = new BigNumber(amount).dividedBy(Math.pow(10, expoent));

        const tokenPrice = tokenPriceQuery.data?.[denom];
        const dollar =
          tokenPrice ? balance.multipliedBy(tokenPrice) : undefined;

        return {
          address,
          amount,
          denom,
          asset,
          balance,
          dollar,
        };
      });
    }, [shieldedBalanceQuery, tokenPriceQuery, denomByAddressQuery]),
  };
});

export const shieldedDollarsAmountAtom = atomWithQuery((get) => {
  const shieldedTokensQuery = get(shieldedTokensAtom);

  return {
    queryKey: ["shielded-dollars-amount", shieldedTokensQuery.data],
    ...queryDependentFn(async () => {
      return sumDollars(shieldedTokensQuery.data) ?? null;
    }, [shieldedTokensQuery]),
  };
});

export const shieldedNamAmountAtom = atomWithQuery((get) => {
  const shieldedBalanceQuery = get(shieldedBalanceAtom);
  const namTokenAddressQuery = get(nativeTokenAddressAtom);

  return {
    queryKey: [
      "shielded-nam-amount",
      shieldedBalanceQuery.data,
      namTokenAddressQuery.data,
    ],
    ...queryDependentFn(async () => {
      const amount = shieldedBalanceQuery.data?.find(
        ([address]) => address === namTokenAddressQuery.data
      )?.[1];
      return new BigNumber(amount ?? 0);
    }, [shieldedBalanceQuery, namTokenAddressQuery]),
  };
});
