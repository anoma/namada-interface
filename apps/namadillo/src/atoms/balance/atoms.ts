import { Asset } from "@chain-registry/types";
import {
  accountsAtom,
  defaultAccountAtom,
  transparentBalanceAtom,
} from "atoms/accounts/atoms";
import { nativeTokenAddressAtom, tokenAddressesAtom } from "atoms/chain";
import { shouldUpdateBalanceAtom } from "atoms/etc";
import { availableAssetsAtom } from "atoms/integrations";
import { queryDependentFn } from "atoms/utils";
import BigNumber from "bignumber.js";
import { atomWithQuery } from "jotai-tanstack-query";
import { namadaAsset } from "registry/namadaAsset";
import { unknownAsset } from "registry/unknownAsset";
import { toDisplayAmount } from "utils";
import { findAssetByToken } from "./functions";
import { fetchCoinPrices, fetchShieldedBalance } from "./services";

export type TokenBalance = {
  asset: Asset;
  balance: BigNumber;
  dollar?: BigNumber;
};

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

export const shieldedBalanceAtom = atomWithQuery<
  { address: string; amount: BigNumber }[]
>((get) => {
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
      if (!viewingKey || !tokenAddresses) {
        return [];
      }
      const response = await fetchShieldedBalance(
        viewingKey,
        tokenAddresses.map((t) => t.address)
      );
      const shieldedBalance = response.map(([address, amount]) => ({
        address,
        amount:
          // Sdk returns the nam amount as `nam` instead of `namnam`
          namTokenAddressQuery.data === address ?
            new BigNumber(amount).shiftedBy(6)
          : new BigNumber(amount),
      }));
      return shieldedBalance;
    }, [viewingKeyQuery, tokenAddressesQuery, namTokenAddressQuery]),
  };
});

export const assetByAddressAtom = atomWithQuery((get) => {
  const tokenAddressesQuery = get(tokenAddressesAtom);
  const namTokenAddressQuery = get(nativeTokenAddressAtom);
  const availableAssets = get(availableAssetsAtom);

  return {
    queryKey: [
      "asset-by-address",
      tokenAddressesQuery.data,
      namTokenAddressQuery.data,
    ],
    queryFn: () => {
      const assetByAddress: Record<string, Asset> = {};
      if (namTokenAddressQuery.data) {
        assetByAddress[namTokenAddressQuery.data] = namadaAsset;
      }
      tokenAddressesQuery.data?.forEach((token) => {
        const asset = findAssetByToken(token, availableAssets);
        if (asset) {
          assetByAddress[token.address] = asset;
        }
      });
      return assetByAddress;
    },
  };
});

export const tokenPricesAtom = atomWithQuery((get) => {
  const shieldedBalanceQuery = get(shieldedBalanceAtom);
  const transparentBalanceQuery = get(transparentBalanceAtom);
  const assetByAddressQuery = get(assetByAddressAtom);

  // Get the list of addresses that exists on balances
  const obj: Record<string, true> = {};
  shieldedBalanceQuery.data?.forEach(({ address }) => {
    obj[address] = true;
  });
  transparentBalanceQuery.data?.forEach(({ address }) => {
    obj[address] = true;
  });
  const addresses = Object.keys(obj);

  return {
    queryKey: ["token-price", addresses, assetByAddressQuery.data],
    queryFn: async () => {
      const addressByBase: Record<string, string> = {};
      addresses.forEach((address) => {
        const base = assetByAddressQuery.data?.[address]?.base;
        if (base) {
          addressByBase[base] = address;
        }
      });
      const assetBaseList = Object.keys(addressByBase);
      const apiResponse =
        assetBaseList.length ?
          await fetchCoinPrices(Object.keys(addressByBase))
        : [];
      // TODO mock NAM price
      // apiResponse[namadaAsset.base] = {
      //   "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4":
      //     "1.000000000000000000000000000000000000",
      // };
      const tokenPrices: Record<string, BigNumber> = {};
      Object.entries(apiResponse).forEach(([base, value]) => {
        const address = addressByBase[base];
        tokenPrices[address] = new BigNumber(Object.values(value)[0]);
      });
      return tokenPrices;
    },
  };
});

export const shieldedTokensAtom = atomWithQuery<TokenBalance[]>((get) => {
  const shieldedBalanceQuery = get(shieldedBalanceAtom);
  const assetByAddressQuery = get(assetByAddressAtom);
  const tokenPricesQuery = get(tokenPricesAtom);

  return {
    queryKey: [
      "shielded-tokens",
      shieldedBalanceQuery.data,
      assetByAddressQuery.data,
      tokenPricesQuery.data,
    ],
    ...queryDependentFn(
      async () =>
        shieldedBalanceQuery.data?.map(({ address, amount }) =>
          formatTokenBalance(
            address,
            amount,
            assetByAddressQuery.data,
            tokenPricesQuery.data
          )
        ) ?? [],
      [shieldedBalanceQuery, tokenPricesQuery, assetByAddressQuery]
    ),
  };
});

export const transparentTokensAtom = atomWithQuery<TokenBalance[]>((get) => {
  const transparentBalanceQuery = get(transparentBalanceAtom);
  const assetByAddressQuery = get(assetByAddressAtom);
  const tokenPricesQuery = get(tokenPricesAtom);

  return {
    queryKey: [
      "transparent-tokens",
      transparentBalanceQuery.data,
      assetByAddressQuery.data,
      tokenPricesQuery.data,
    ],
    ...queryDependentFn(
      async () =>
        transparentBalanceQuery.data?.map(({ address, amount }) =>
          formatTokenBalance(
            address,
            amount,
            assetByAddressQuery.data,
            tokenPricesQuery.data
          )
        ) ?? [],
      [transparentBalanceQuery, tokenPricesQuery, assetByAddressQuery]
    ),
  };
});

const formatTokenBalance = (
  address: string,
  amount: BigNumber,
  assetsByAddress?: Record<string, Asset>,
  tokenPrices?: Record<string, BigNumber>
): TokenBalance => {
  const asset = assetsByAddress?.[address] ?? unknownAsset;
  const balance = toDisplayAmount(asset, amount);

  const tokenPrice = tokenPrices?.[address];
  const dollar = tokenPrice ? balance.multipliedBy(tokenPrice) : undefined;

  return {
    asset,
    balance,
    dollar,
  };
};
